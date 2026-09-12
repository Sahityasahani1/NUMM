"""
Unit tests for HierarchicalTaxonomyService (Pillar 5 of v3.0-AI-SPEC).
Validates 4-tier UNSPSC mapping, dynamic critical attribute extraction, and taxonomy tree distance.
"""

import pytest
from app.services.taxonomy_classifier import HierarchicalTaxonomyService

def test_classify_valve_commodity():
    svc = HierarchicalTaxonomyService()
    tax = svc.classify_taxonomy("BALL VALVE 2 INCH 150# RF A216 WCB")
    assert tax["commodity"] == "40141607"
    assert tax["class_code"] == "40141600"
    assert tax["commodity_name"] == "Ball Valves"
    assert "sour_gas" in tax["critical_attributes"]
    assert "dimensions" in tax["critical_attributes"]

def test_classify_pipe_flange():
    svc = HierarchicalTaxonomyService()
    tax = svc.classify_taxonomy("FLANGE WELD NECK 4 INCH 300# RF A105")
    assert tax["commodity"] == "40141753"
    assert tax["commodity_name"] == "Weld Neck Flanges"
    assert "flange_facing" in tax["critical_attributes"]

def test_taxonomy_tree_distance():
    svc = HierarchicalTaxonomyService()
    tax_ball_valve = svc.classify_taxonomy("BALL VALVE 2 INCH 150# RF")
    tax_gate_valve = svc.classify_taxonomy("GATE VALVE 2 INCH 150# RF")
    tax_pipe = svc.classify_taxonomy("SEAMLESS STEEL PIPE 6 INCH SCH 40 A106")

    # Ball valve vs Gate valve: same class 40141600, different commodities
    # Distance: 1 hop up to class, 1 hop down = 2 hops
    dist_valves = svc.calculate_tree_distance(tax_ball_valve["commodity"], tax_gate_valve["commodity"])
    assert dist_valves == 2

    # Ball valve (Valves class 40141600, family 40140000) vs Flange (Flange class 40141700, family 40140000)
    tax_flange = svc.classify_taxonomy("FLANGE WELD NECK 4 INCH 300# RF")
    # Distance: 2 hops up to family, 2 hops down = 4 hops
    dist_valve_flange = svc.calculate_tree_distance(tax_ball_valve["commodity"], tax_flange["commodity"])
    assert dist_valve_flange == 4

    # Ball valve (family 4014) vs Pipe (family 4017): same segment 40000000
    # Distance: 3 hops up to segment, 3 hops down = 6 hops
    dist_valve_pipe = svc.calculate_tree_distance(tax_ball_valve["commodity"], tax_pipe["commodity"])
    assert dist_valve_pipe == 6

def test_extract_category_conditioned_attributes():
    svc = HierarchicalTaxonomyService()
    # Ball valve description with dimensions, rating, facing, trim
    attrs = svc.extract_conditioned_attributes("BALL VALVE 2 INCH 150# RF A216 WCB TRIM 316SS NACE MR0175")
    assert attrs["commodity"] == "40141607"
    ext = attrs["extracted_attributes"]
    assert ext.get("dimensions") is not None
    assert ext.get("pressure_rating") is not None
    assert bool(ext.get("sour_gas")) is True
    assert ext.get("valve_trim") is not None

def test_classify_expanded_10_sector_commodities():
    svc = HierarchicalTaxonomyService()
    
    # 1. Control Valve
    tax_ctrl = svc.classify_taxonomy("PNEUMATIC GLOBE CONTROL VALVE 3 INCH 300# LINEAR")
    assert tax_ctrl["commodity"] == "40141603"
    assert tax_ctrl["commodity_name"] == "Control Valves"

    # 2. Safety/Relief Valve
    tax_prv = svc.classify_taxonomy("PRESSURE SAFETY VALVE 2X3 INCH 150#X300# ORIFICE G")
    assert tax_prv["commodity"] == "40141606"
    assert tax_prv["commodity_name"] == "Safety and Relief Valves"

    # 3. Pipe Elbow
    tax_elbow = svc.classify_taxonomy("90 DEG ELBOW LR 4 INCH SCH 40 ASTM A234 WPB")
    assert tax_elbow["commodity"] == "40141720"
    assert tax_elbow["commodity_name"] == "Pipe Elbows"

    # 4. Pipe Tee
    tax_tee = svc.classify_taxonomy("EQUAL TEE 6 INCH SCH 80 ASTM A234 WPB")
    assert tax_tee["commodity"] == "40141725"
    assert tax_tee["commodity_name"] == "Pipe Tees"

    # 5. Compressor
    tax_comp = svc.classify_taxonomy("CENTRIFUGAL COMPRESSOR MULTI STAGE 1500 KW")
    assert tax_comp["commodity"] == "40151601"
    assert tax_comp["commodity_name"] == "Gas and Air Compressors"

    # 6. Temperature Transmitter
    tax_temp = svc.classify_taxonomy("TEMPERATURE TRANSMITTER HART PT100 RTD DUPLEX 4-20MA")
    assert tax_temp["commodity"] == "41112209"
    assert tax_temp["commodity_name"] == "Temperature Transmitters and RTDs"

    # 7. Flowmeter
    tax_flow = svc.classify_taxonomy("CORIOLIS MASS FLOWMETER 2 INCH 150# HIGH ACCURACY")
    assert tax_flow["commodity"] == "41112501"
    assert tax_flow["commodity_name"] == "Industrial Flowmeters"

    # 8. Cable
    tax_cable = svc.classify_taxonomy("POWER CABLE 4C X 16 SQMM XLPE SWA PVC 0.6/1KV")
    assert tax_cable["commodity"] == "26121601"
    assert tax_cable["commodity_name"] == "Armoured Power and Control Cables"

    # 9. Circuit Breaker
    tax_mccb = svc.classify_taxonomy("MOULDED CASE CIRCUIT BREAKER MCCB 3 POLE 400A 50KA")
    assert tax_mccb["commodity"] == "39121601"
    assert tax_mccb["commodity_name"] == "Molded Case Circuit Breakers (MCCB)"

    # 10. Lubricant / Turbine Oil
    tax_oil = svc.classify_taxonomy("SYNTHETIC TURBINE OIL ISO VG 46 LUBRICANT")
    assert tax_oil["commodity"] == "15121501"
    assert tax_oil["commodity_name"] == "Turbine and Compressor Oils"
