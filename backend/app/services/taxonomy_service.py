from typing import Tuple, Optional, Dict, Any

class TaxonomyService:
    TAXONOMY_MAP = {
        # 8-digit UNSPSC Commodity Codes
        "BALL VALVE": ("40141607", "Valves and actuators - Ball valves"),
        "GATE VALVE": ("40141604", "Valves and actuators - Gate valves"),
        "GLOBE VALVE": ("40141602", "Valves and actuators - Globe valves"),
        "CHECK VALVE": ("40141601", "Valves and actuators - Check valves"),
        "BUTTERFLY VALVE": ("40141618", "Valves and actuators - Butterfly valves"),
        "NEEDLE VALVE": ("40141609", "Valves and actuators - Needle valves"),
        "PLUG VALVE": ("40141612", "Valves and actuators - Plug valves"),
        "CONTROL VALVE": ("40141606", "Valves and actuators - Control valves"),
        "VALVE": ("40141600", "Valves and actuators"),

        "WELD NECK FLANGE": ("40141753", "Pipe fittings, flanges and joints - Weld neck flanges"),
        "BLIND FLANGE": ("40141754", "Pipe fittings, flanges and joints - Blind flanges"),
        "SLIP ON FLANGE": ("40141755", "Pipe fittings, flanges and joints - Slip on flanges"),
        "SOCKET WELD FLANGE": ("40141756", "Pipe fittings, flanges and joints - Socket weld flanges"),
        "FLANGE": ("40141700", "Pipe fittings, flanges and joints"),

        "SEAMLESS PIPE": ("40142115", "Pipes and tubing - Seamless carbon steel pipes"),
        "ERW PIPE": ("40142116", "Pipes and tubing - Welded pipes"),
        "PIPE": ("40142100", "Pipes and tubing"),

        "SPIRAL WOUND GASKET": ("31181502", "Gaskets and packings - Spiral wound gaskets"),
        "RING JOINT GASKET": ("31181504", "Gaskets and packings - Ring joint gaskets"),
        "GASKET": ("31181500", "Gaskets and packings"),

        "STUD BOLT": ("31161601", "Fasteners and bolts - Stud bolts"),
        "HEX BOLT": ("31161620", "Fasteners and bolts - Hex bolts"),
        "BOLT": ("31161500", "Fasteners and bolts"),
        "FASTENER": ("31161500", "Fasteners and bolts"),

        "CENTRIFUGAL PUMP": ("40151503", "Pumps and compressors - Centrifugal pumps"),
        "PUMP": ("40151500", "Pumps and compressors")
    }

    @classmethod
    def classify(cls, noun: Optional[str] = None, modifier: Optional[str] = None) -> Tuple[str, str]:
        if not noun:
            return "23150000", "General industrial machinery and accessories"
            
        combined = f"{modifier} {noun}".strip().upper() if modifier else noun.upper()
        
        # Check specific combinations first (e.g. BALL VALVE, WELD NECK FLANGE)
        for key, (unspsc, label) in cls.TAXONOMY_MAP.items():
            if key in combined:
                return unspsc, label
                
        # Check noun alone
        noun_upper = noun.upper()
        for key, (unspsc, label) in cls.TAXONOMY_MAP.items():
            if key in noun_upper:
                return unspsc, label
                
        return "23150000", "General industrial machinery and accessories"

    @classmethod
    def classify_hierarchical(cls, text: str) -> Dict[str, Any]:
        text_upper = text.upper()
        if "BEARING" in text_upper:
            return {
                "segment_code": "31000000",
                "segment_name": "Manufacturing and Processing Machinery and Accessories",
                "family_code": "31170000",
                "family_name": "Bearings and bushings",
                "class_code": "31171500",
                "class_name": "Bearings",
                "commodity_code": "31171504",
                "commodity_title": "Ball bearings",
                "required_attributes": ["part_number", "dimensions"]
            }
        else:
            return {
                "segment_code": "40000000",
                "segment_name": "Distribution and Conditioning Systems",
                "family_code": "40140000",
                "family_name": "Fluid and Gas Distribution",
                "class_code": "40141600",
                "class_name": "Valves",
                "commodity_code": "40141604",
                "commodity_title": "Ball valves",
                "required_attributes": ["pressure_rating", "flange_facing", "dimensions", "material_grade"]
            }
