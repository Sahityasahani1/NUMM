"""
National Unified Material Master (NUMM) · 4-Level Hierarchical UNSPSC Classifier
Implements hierarchical 4-tier taxonomy modeling (Segment -> Family -> Class -> Commodity)
and category-conditioned dynamic attribute extraction.
"""

from typing import Dict, Any, List, Optional, Tuple

class HierarchicalTaxonomyService:
    # 4-Level UNSPSC Tree: Segment (2-digit) -> Family (4-digit) -> Class (6-digit) -> Commodity (8-digit)
    UNSPSC_TREE: Dict[str, Dict[str, Any]] = {
        # Segment 40: Distribution and Conditioning Systems and Equipment and Components
        "40141607": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141600",
            "class_name": "Valves",
            "commodity": "40141607",
            "commodity_name": "Ball Valves",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "flange_facing", "valve_trim", "fire_safe", "sour_gas"]
        },
        "40141601": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141600",
            "class_name": "Valves",
            "commodity": "40141601",
            "commodity_name": "Gate Valves",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "flange_facing", "valve_trim", "fire_safe", "sour_gas"]
        },
        "40141602": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141600",
            "class_name": "Valves",
            "commodity": "40141602",
            "commodity_name": "Globe Valves",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "flange_facing", "valve_trim"]
        },
        "40141604": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141600",
            "class_name": "Valves",
            "commodity": "40141604",
            "commodity_name": "Check Valves",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "flange_facing"]
        },
        "40141605": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141600",
            "class_name": "Valves",
            "commodity": "40141605",
            "commodity_name": "Butterfly Valves",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "seat_material"]
        },
        "40141753": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141700",
            "class_name": "Pipe Fittings and Flanges",
            "commodity": "40141753",
            "commodity_name": "Weld Neck Flanges",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "schedule", "flange_facing"]
        },
        "40141754": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141700",
            "class_name": "Pipe Fittings and Flanges",
            "commodity": "40141754",
            "commodity_name": "Blind Flanges",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "flange_facing"]
        },
        "40171501": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40170000",
            "family_name": "Pipe and Tube",
            "class": "40171500",
            "class_name": "Industrial Pipes",
            "commodity": "40171501",
            "commodity_name": "Carbon Steel Seamless Pipes",
            "critical_attributes": ["dimensions", "schedule", "material_grade", "standard", "sour_gas"]
        },
        "40171502": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40170000",
            "family_name": "Pipe and Tube",
            "class": "40171500",
            "class_name": "Industrial Pipes",
            "commodity": "40171502",
            "commodity_name": "Stainless Steel Seamless Pipes",
            "critical_attributes": ["dimensions", "schedule", "material_grade", "standard"]
        },
        "31181501": {
            "segment": "31000000",
            "segment_name": "Manufacturing and Processing Machinery",
            "family": "31180000",
            "family_name": "Gaskets and Seals",
            "class": "31181500",
            "class_name": "Sealing Devices",
            "commodity": "31181501",
            "commodity_name": "Spiral Wound Gaskets",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "filler_material"]
        },
        "31161601": {
            "segment": "31000000",
            "segment_name": "Manufacturing and Processing Machinery",
            "family": "31160000",
            "family_name": "Hardware",
            "class": "31161600",
            "class_name": "Bolts and Screws",
            "commodity": "31161601",
            "commodity_name": "Stud Bolts with Nuts",
            "critical_attributes": ["dimensions", "material_grade", "standard"]
        },
        "40151503": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40150000",
            "family_name": "Pumps and Compressors",
            "class": "40151500",
            "class_name": "Pumps",
            "commodity": "40151503",
            "commodity_name": "Centrifugal Pumps",
            "critical_attributes": ["capacity", "head", "power_rating", "hazardous_area"]
        },
        "41111901": {
            "segment": "41000000",
            "segment_name": "Laboratory and Measuring and Testing Equipment",
            "family": "41110000",
            "family_name": "Measuring and Observing Instruments",
            "class": "41111900",
            "class_name": "Pressure Measuring Instruments",
            "commodity": "41111901",
            "commodity_name": "Pressure Transmitters",
            "critical_attributes": ["range", "output_signal", "hazardous_area", "material_grade"]
        },
        "40141603": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141600",
            "class_name": "Valves",
            "commodity": "40141603",
            "commodity_name": "Control Valves",
            "critical_attributes": ["dimensions", "pressure_rating", "material_grade", "actuator_type", "valve_trim"]
        },
        "40141606": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141600",
            "class_name": "Valves",
            "commodity": "40141606",
            "commodity_name": "Safety and Relief Valves",
            "critical_attributes": ["set_pressure", "dimensions", "orifice_size", "material_grade"]
        },
        "40141720": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141700",
            "class_name": "Pipe Fittings and Flanges",
            "commodity": "40141720",
            "commodity_name": "Pipe Elbows",
            "critical_attributes": ["dimensions", "schedule", "material_grade", "bend_angle", "standard"]
        },
        "40141725": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40140000",
            "family_name": "Fluid and Gas Distribution",
            "class": "40141700",
            "class_name": "Pipe Fittings and Flanges",
            "commodity": "40141725",
            "commodity_name": "Pipe Tees",
            "critical_attributes": ["dimensions", "schedule", "material_grade", "tee_type", "standard"]
        },
        "40151601": {
            "segment": "40000000",
            "segment_name": "Distribution and Conditioning Systems",
            "family": "40150000",
            "family_name": "Pumps and Compressors",
            "class": "40151600",
            "class_name": "Compressors",
            "commodity": "40151601",
            "commodity_name": "Gas and Air Compressors",
            "critical_attributes": ["flow_rate", "discharge_pressure", "power_rating", "hazardous_area"]
        },
        "41112209": {
            "segment": "41000000",
            "segment_name": "Laboratory and Measuring and Testing Equipment",
            "family": "41110000",
            "family_name": "Measuring and Observing Instruments",
            "class": "41112200",
            "class_name": "Temperature Instruments",
            "commodity": "41112209",
            "commodity_name": "Temperature Transmitters and RTDs",
            "critical_attributes": ["temperature_range", "element_type", "output_signal", "hazardous_area"]
        },
        "41112501": {
            "segment": "41000000",
            "segment_name": "Laboratory and Measuring and Testing Equipment",
            "family": "41110000",
            "family_name": "Measuring and Observing Instruments",
            "class": "41112500",
            "class_name": "Flow and Level Instruments",
            "commodity": "41112501",
            "commodity_name": "Industrial Flowmeters",
            "critical_attributes": ["line_size", "flow_rate", "accuracy_class", "material_grade"]
        },
        "26121601": {
            "segment": "26000000",
            "segment_name": "Power Generation and Distribution",
            "family": "26120000",
            "family_name": "Electrical Wire and Cable and Harness",
            "class": "26121600",
            "class_name": "Power Cables",
            "commodity": "26121601",
            "commodity_name": "Armoured Power and Control Cables",
            "critical_attributes": ["voltage_grade", "core_count", "cross_section_sqmm", "insulation"]
        },
        "39121601": {
            "segment": "39000000",
            "segment_name": "Electrical Systems and Lighting",
            "family": "39120000",
            "family_name": "Electrical Equipment and Components",
            "class": "39121600",
            "class_name": "Circuit Breakers and Switchgear",
            "commodity": "39121601",
            "commodity_name": "Molded Case Circuit Breakers (MCCB)",
            "critical_attributes": ["current_rating", "breaking_capacity", "pole_count", "voltage"]
        },
        "15121501": {
            "segment": "15000000",
            "segment_name": "Fuels and Fuel Additives and Lubricants",
            "family": "15120000",
            "family_name": "Lubricants and Oils and Greases",
            "class": "15121500",
            "class_name": "Industrial Lubricants",
            "commodity": "15121501",
            "commodity_name": "Turbine and Compressor Oils",
            "critical_attributes": ["iso_vg_grade", "viscosity_index", "flash_point"]
        }
    }

    @classmethod
    def classify(cls, noun: Optional[str], modifier: Optional[str] = None, full_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Hierarchically classifies item noun & modifier into 4-tier UNSPSC metadata.
        """
        n = (noun or "").upper()
        m = (modifier or "").upper()
        if not n and full_text:
            n = full_text.upper()
        nm = f"{m} {n}".strip()

        code = "40141600" # Fallback Valves

        if "CONTROL VALVE" in n or ("VALVE" in n and "CONTROL" in m):
            code = "40141603"
        elif "RELIEF" in n or "SAFETY VALVE" in n or ("VALVE" in n and "SAFETY" in m):
            code = "40141606"
        elif "BALL VALVE" in n or ("VALVE" in n and "BALL" in m):
            code = "40141607"
        elif "GATE VALVE" in n or ("VALVE" in n and "GATE" in m):
            code = "40141601"
        elif "GLOBE VALVE" in n or ("VALVE" in n and "GLOBE" in m):
            code = "40141602"
        elif "CHECK VALVE" in n or ("VALVE" in n and "CHECK" in m):
            code = "40141604"
        elif "BUTTERFLY VALVE" in n or ("VALVE" in n and "BUTTERFLY" in m):
            code = "40141605"
        elif "VALVE" in n:
            code = "40141607"
        elif "ELBOW" in n:
            code = "40141720"
        elif "TEE" in n:
            code = "40141725"
        elif "REDUCER" in n:
            code = "40141720"
        elif "WELD NECK" in n or "WELD NECK" in m or ("FLANGE" in n and "WELD" in m):
            code = "40141753"
        elif "BLIND FLANGE" in n or ("FLANGE" in n and "BLIND" in m):
            code = "40141754"
        elif "FLANGE" in n:
            code = "40141753"
        elif "SEAMLESS PIPE" in n or ("PIPE" in n and "SEAMLESS" in m):
            code = "40171501"
        elif "PIPE" in n and ("STAINLESS" in nm or "SS" in nm):
            code = "40171502"
        elif "PIPE" in n:
            code = "40171501"
        elif "GASKET" in n:
            code = "31181501"
        elif "BOLT" in n or "STUD" in n or "FASTENER" in n:
            code = "31161601"
        elif "COMPRESSOR" in n:
            code = "40151601"
        elif "PUMP" in n:
            code = "40151503"
        elif "FLOW" in n or "FLOWMETER" in n:
            code = "41112501"
        elif "RTD" in n or "TEMPERATURE" in n:
            code = "41112209"
        elif "TRANSMITTER" in n or "GAUGE" in n:
            code = "41111901"
        elif "CABLE" in n or "WIRE" in n:
            code = "26121601"
        elif "BREAKER" in n or "SWITCHGEAR" in n or "MCCB" in n:
            code = "39121601"
        elif "OIL" in n or "LUBRICANT" in n or "GREASE" in n:
            code = "15121501"

        taxonomy = cls.UNSPSC_TREE.get(code, cls.UNSPSC_TREE["40141607"])
        return {
            "unspsc_code": code,
            "commodity_name": taxonomy["commodity_name"],
            "class_code": taxonomy["class"],
            "class_name": taxonomy["class_name"],
            "family_code": taxonomy["family"],
            "family_name": taxonomy["family_name"],
            "segment_code": taxonomy["segment"],
            "segment_name": taxonomy["segment_name"],
            "critical_attributes": taxonomy["critical_attributes"]
        }

    @classmethod
    def calculate_taxonomy_agreement(cls, code1: Optional[str], code2: Optional[str]) -> Tuple[float, str]:
        """
        Calculates hierarchical taxonomy tree distance agreement:
        - Exact Commodity (8 digits): 1.0
        - Same Class (6 digits): 0.85
        - Same Family (4 digits): 0.50
        - Same Segment (2 digits): 0.20
        - Cross-Segment: 0.0
        """
        if not code1 or not code2:
            return 0.5, "Taxonomy neutral (unspecified)"

        c1 = str(code1).strip()
        c2 = str(code2).strip()

        if c1 == c2:
            return 1.0, f"Exact Commodity Match ({c1})"
        if c1[:6] == c2[:6]:
            return 0.85, f"Same UNSPSC Class ({c1[:6]}xx)"
        if c1[:4] == c2[:4]:
            return 0.50, f"Same UNSPSC Family ({c1[:4]}xxxx)"
        return 0.0, f"Cross-Segment Divergence ({c1[:2]} vs {c2[:2]})"

    @classmethod
    def classify_taxonomy(cls, text: str) -> Dict[str, Any]:
        """
        Convenience method to classify raw material text into 4-level UNSPSC metadata.
        """
        from app.services.attribute_extractor import AttributeExtractor
        attrs = AttributeExtractor.extract_attributes(text)
        res = cls.classify(noun=attrs.get("noun"), modifier=attrs.get("modifier"), full_text=text)
        res["commodity"] = res["unspsc_code"]
        return res

    @classmethod
    def calculate_tree_distance(cls, code1: Optional[str], code2: Optional[str]) -> int:
        """
        Calculates hierarchical tree distance in terms of graph hops:
        - 0 hops: Exact Commodity (8 digits match)
        - 2 hops: Same Class (6 digits match)
        - 4 hops: Same Family (4 digits match)
        - 6 hops: Same Segment (2 digits match)
        - 8 hops: Cross-segment
        """
        if not code1 or not code2:
            return 8
        c1 = str(code1).strip()
        c2 = str(code2).strip()
        if c1 == c2:
            return 0
        if c1[:6] == c2[:6]:
            return 2
        if c1[:4] == c2[:4]:
            return 4
        if c1[:2] == c2[:2]:
            return 6
        return 8

    @classmethod
    def extract_conditioned_attributes(cls, text: str) -> Dict[str, Any]:
        """
        Extracts attributes conditioned on the classified category's critical attributes.
        """
        from app.services.attribute_extractor import AttributeExtractor
        tax = cls.classify_taxonomy(text)
        all_attrs = AttributeExtractor.extract_attributes(text)
        critical = set(tax.get("critical_attributes", []))
        
        # Include all extracted attributes, highlighting category-critical presence
        conditioned = {k: v for k, v in all_attrs.items() if k in critical and v is not None}
        
        return {
            "commodity": tax["commodity"],
            "commodity_name": tax["commodity_name"],
            "critical_attributes": list(critical),
            "extracted_attributes": all_attrs,
            "conditioned_critical": conditioned
        }
