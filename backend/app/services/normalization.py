import re
from typing import Dict, Tuple

class NormalizationService:
    ABBREVIATION_DICT: Dict[str, str] = {
        "SS": "STAINLESS STEEL",
        "SST": "STAINLESS STEEL",
        "CS": "CARBON STEEL",
        "CI": "CAST IRON",
        "DI": "DUCTILE IRON",
        "BRS": "BRASS",
        "COP": "COPPER",
        "TI": "TITANIUM",
        "VLV": "VALVE",
        "FLG": "FLANGE",
        "GSKT": "GASKET",
        "BLT": "BOLT",
        "SCRW": "SCREW",
        "FIT": "FITTING",
        "DIA": "DIAMETER",
        "THK": "THICKNESS",
        "LG": "LENGTH",
        "OD": "OUTSIDE DIAMETER",
        "ID": "INSIDE DIAMETER",
        "SCH": "SCHEDULE",
        "CL": "CLASS",
        "CLS": "CLASS",
        "SW": "SOCKET WELD",
        "BW": "BUTT WELD",
        "NPT": "NATIONAL PIPE THREAD",
        "RF": "RAISED FACE",
        "FF": "FLAT FACE",
        "RTJ": "RING TYPE JOINT",
        "GALV": "GALVANIZED",
        "HEX": "HEXAGONAL",
        "STD": "STANDARD",
        "TEMP": "TEMPERATURE",
        "PRESS": "PRESSURE",
        "ELEM": "ELEMENT",
        "ASSY": "ASSEMBLY",
        "REQ": "REQUIRED",
        "QTY": "QUANTITY",
        "SMLS": "SEAMLESS",
        "BLV": "BALL VALVE",
        "BL": "BALL"
    }

    UOM_DICT: Dict[str, str] = {
        "NOS": "EA",
        "NO": "EA",
        "NOS.": "EA",
        "NUMBER": "EA",
        "NUMBERS": "EA",
        "EACH": "EA",
        "EA": "EA",
        "PC": "EA",
        "PCS": "EA",
        "PIECE": "EA",
        "PIECES": "EA",
        "MTR": "MTR",
        "M": "MTR",
        "METER": "MTR",
        "METERS": "MTR",
        "KG": "KG",
        "KGS": "KG",
        "KILOGRAM": "KG",
        "KILOGRAMS": "KG",
        "SET": "SET",
        "SETS": "SET",
        "LOT": "LOT",
        "LTR": "LTR",
        "LITRE": "LTR",
        "LITRES": "LTR",
        "BOX": "BOX",
        "ROLL": "ROLL"
    }

    DIMENSION_INCH_MAP: Dict[str, str] = {
        '1/2"': '1/2 INCH (DN15)',
        '1/2 INCH': '1/2 INCH (DN15)',
        '1/2IN': '1/2 INCH (DN15)',
        '3/4"': '3/4 INCH (DN20)',
        '3/4 INCH': '3/4 INCH (DN20)',
        '1"': '1 INCH (DN25)',
        '1 INCH': '1 INCH (DN25)',
        '1-1/2"': '1-1/2 INCH (DN40)',
        '1.5"': '1-1/2 INCH (DN40)',
        '2"': '2 INCH (DN50)',
        '2 INCH': '2 INCH (DN50)',
        '2IN': '2 INCH (DN50)',
        '3"': '3 INCH (DN80)',
        '3 INCH': '3 INCH (DN80)',
        '4"': '4 INCH (DN100)',
        '4 INCH': '4 INCH (DN100)',
        '6"': '6 INCH (DN150)',
        '6 INCH': '6 INCH (DN150)',
        '8"': '8 INCH (DN200)',
        '8 INCH': '8 INCH (DN200)',
        '10"': '10 INCH (DN250)',
        '10 INCH': '10 INCH (DN250)',
        '12"': '12 INCH (DN300)',
        '12 INCH': '12 INCH (DN300)'
    }

    @classmethod
    def normalize_text(cls, text: str) -> str:
        if not text:
            return ""
        
        normalized = text.upper()
        normalized = re.sub(r'[\r\n\t]+', ' ', normalized)

        # Stage 1: Standardize pressure ratings (e.g. 150 LB, 150LBS, CLASS 150 -> 150#)
        normalized = re.sub(r'\bCLASS\s*(\d+)\b', r'\1#', normalized)
        normalized = re.sub(r'\b(\d+)\s*LB[S]?\b', r'\1#', normalized)

        # Stage 1: Standardize dimensions (e.g. 2", 2IN -> 2 INCH)
        normalized = re.sub(r'\b(\d+(?:/\d+)?)\s*\"(?!\w)', r'\1 INCH ', normalized)
        normalized = re.sub(r'\b(\d+(?:/\d+)?)\s*IN\b', r'\1 INCH ', normalized)

        normalized = re.sub(r'[,;:/_\\|-]+', ' ', normalized)
        
        tokens = normalized.split()
        expanded_tokens = []
        for token in tokens:
            token_clean = re.sub(r'[^A-Z0-9\"#.]', '', token)
            if token_clean in cls.ABBREVIATION_DICT:
                expanded_tokens.append(cls.ABBREVIATION_DICT[token_clean])
            else:
                expanded_tokens.append(token)
                
        cleaned = " ".join(expanded_tokens)
        
        # Stage 1: Normalize common inverted engineering noun phrases
        cleaned = re.sub(r'\bVALVE\s+(BALL|GATE|GLOBE|CHECK|BUTTERFLY|PLUG|NEEDLE)\b', r'\1 VALVE', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\bFLANGE\s+(WELD\s*NECK|BLIND|SLIP\s*ON|SOCKET\s*WELD|THREADED)\b', r'\1 FLANGE', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\bPIPE\s+(SEAMLESS|ERW|WELDED)\b', r'\1 PIPE', cleaned, flags=re.IGNORECASE)

        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    @classmethod
    def normalize_uom(cls, uom: str) -> str:
        if not uom:
            return "EA"
        clean = uom.strip().upper().replace(".", "")
        return cls.UOM_DICT.get(clean, clean)

    @classmethod
    def standardize_dimension(cls, dim_text: str) -> str:
        if not dim_text:
            return ""
        cleaned = dim_text.strip().upper()
        return cls.DIMENSION_INCH_MAP.get(cleaned, cleaned)

    GRADE_ALIAS_MAP: Dict[str, str] = {
        "WCB": "ASTM A216 WCB",
        "A216 WCB": "ASTM A216 WCB",
        "ASTM A216 WCB": "ASTM A216 WCB",
        "A216-WCB": "ASTM A216 WCB",
        "CS WCB": "ASTM A216 WCB",
        "A105": "ASTM A105",
        "A105N": "ASTM A105",
        "ASTM A105": "ASTM A105",
        "ASTM A105N": "ASTM A105",
        "LF2": "ASTM A350 LF2",
        "A350 LF2": "ASTM A350 LF2",
        "ASTM A350 LF2": "ASTM A350 LF2",
        "A350-LF2": "ASTM A350 LF2",
        "SS316": "SS 316 / ASTM A182 F316",
        "SS 316": "SS 316 / ASTM A182 F316",
        "SS316L": "SS 316 / ASTM A182 F316",
        "SS 316L": "SS 316 / ASTM A182 F316",
        "AISI 316": "SS 316 / ASTM A182 F316",
        "AISI 316L": "SS 316 / ASTM A182 F316",
        "SUS 316": "SS 316 / ASTM A182 F316",
        "SUS 316L": "SS 316 / ASTM A182 F316",
        "ASTM A182 F316": "SS 316 / ASTM A182 F316",
        "ASTM A182 F316L": "SS 316 / ASTM A182 F316",
        "A182 F316": "SS 316 / ASTM A182 F316",
        "A182 F316L": "SS 316 / ASTM A182 F316",
        "F316": "SS 316 / ASTM A182 F316",
        "F316L": "SS 316 / ASTM A182 F316",
        "316 SS": "SS 316 / ASTM A182 F316",
        "316L SS": "SS 316 / ASTM A182 F316",
        "SS304": "SS 304 / ASTM A182 F304",
        "SS 304": "SS 304 / ASTM A182 F304",
        "SS304L": "SS 304 / ASTM A182 F304",
        "SS 304L": "SS 304 / ASTM A182 F304",
        "AISI 304": "SS 304 / ASTM A182 F304",
        "AISI 304L": "SS 304 / ASTM A182 F304",
        "SUS 304": "SS 304 / ASTM A182 F304",
        "ASTM A182 F304": "SS 304 / ASTM A182 F304",
        "ASTM A182 F304L": "SS 304 / ASTM A182 F304",
        "A182 F304": "SS 304 / ASTM A182 F304",
        "F304": "SS 304 / ASTM A182 F304",
        "F304L": "SS 304 / ASTM A182 F304",
        "304 SS": "SS 304 / ASTM A182 F304",
        "INCONEL 625": "INCONEL 625",
        "INCONEL625": "INCONEL 625",
        "ALLOY 625": "INCONEL 625",
        "INCONEL 718": "INCONEL 718",
        "INCONEL718": "INCONEL 718",
        "ALLOY 718": "INCONEL 718",
        "MONEL 400": "MONEL 400",
        "MONEL400": "MONEL 400",
        "ALLOY 400": "MONEL 400",
        "HASTELLOY C276": "HASTELLOY C276",
        "HASTELLOY C-276": "HASTELLOY C276",
        "C276": "HASTELLOY C276",
        "DUPLEX 2205": "DUPLEX 2205",
        "2205 DUPLEX": "DUPLEX 2205",
        "UNS S31803": "DUPLEX 2205",
        "SUPER DUPLEX 2507": "SUPER DUPLEX 2507",
        "2507": "SUPER DUPLEX 2507",
        "STAINLESS STEEL": "STAINLESS STEEL",
        "CARBON STEEL": "CARBON STEEL",
        "ALLOY STEEL": "ALLOY STEEL",
        "CAST IRON": "CAST IRON",
        "BRONZE": "BRONZE",
        "BRASS": "BRASS"
    }

    PRESSURE_RATINGS_STANDARD: Dict[str, str] = {
        "150": "150#",
        "150#": "150#",
        "150LB": "150#",
        "150LBS": "150#",
        "CLASS150": "150#",
        "300": "300#",
        "300#": "300#",
        "300LB": "300#",
        "300LBS": "300#",
        "CLASS300": "300#",
        "600": "600#",
        "600#": "600#",
        "600LB": "600#",
        "600LBS": "600#",
        "CLASS600": "600#",
        "900": "900#",
        "900#": "900#",
        "900LB": "900#",
        "900LBS": "900#",
        "CLASS900": "900#",
        "1500": "1500#",
        "1500#": "1500#",
        "1500LB": "1500#",
        "1500LBS": "1500#",
        "CLASS1500": "1500#",
        "2500": "2500#",
        "2500#": "2500#",
        "2500LB": "2500#",
        "2500LBS": "2500#",
        "CLASS2500": "2500#",
        "3000#": "3000#",
        "3000PSI": "3000#",
        "6000#": "6000#",
        "6000PSI": "6000#",
        "PN10": "PN 10",
        "PN16": "PN 16",
        "PN25": "PN 25",
        "PN40": "PN 40",
        "PN64": "PN 64",
        "PN100": "PN 100"
    }

    @classmethod
    def canonicalize_material_grade(cls, grade_str: str) -> str:
        if not grade_str:
            return ""
        cleaned = re.sub(r'[\r\n\t]+', ' ', str(grade_str).upper()).strip()
        cleaned = re.sub(r'[\-_]', ' ', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        if cleaned in cls.GRADE_ALIAS_MAP:
            return cls.GRADE_ALIAS_MAP[cleaned]
        no_space = cleaned.replace(" ", "")
        for k, v in cls.GRADE_ALIAS_MAP.items():
            if k.replace(" ", "") == no_space:
                return v
        return cleaned

    METALLURGY_FAMILIES: Dict[str, str] = {
        # Carbon Steel (Forged A105, Cast WCB, Pipe A106/API 5L, Fitting WPB)
        "ASTM A105": "CARBON_STEEL",
        "ASTM A105N": "CARBON_STEEL",
        "ASTM A216 WCB": "CARBON_STEEL",
        "WCB": "CARBON_STEEL",
        "A105": "CARBON_STEEL",
        "ASTM A106": "CARBON_STEEL",
        "ASTM A106 GRADE B": "CARBON_STEEL",
        "API 5L GRADE B": "CARBON_STEEL",
        "ASTM A234 WPB": "CARBON_STEEL",
        "WPB": "CARBON_STEEL",
        "CS": "CARBON_STEEL",
        "CARBON STEEL": "CARBON_STEEL",
        
        # Low Temperature Carbon Steel
        "ASTM A350 LF2": "LOW_TEMP_CARBON_STEEL",
        "LF2": "LOW_TEMP_CARBON_STEEL",
        "ASTM A333 GRADE 6": "LOW_TEMP_CARBON_STEEL",
        "LTCS": "LOW_TEMP_CARBON_STEEL",
        
        # Stainless Steel 316 / 316L (Molybdenum-bearing austenitic)
        "SS 316 / ASTM A182 F316": "STAINLESS_STEEL_316",
        "SS 316": "STAINLESS_STEEL_316",
        "SS316": "STAINLESS_STEEL_316",
        "SS 316L": "STAINLESS_STEEL_316",
        "SS316L": "STAINLESS_STEEL_316",
        "ASTM A182 F316": "STAINLESS_STEEL_316",
        "ASTM A182 F316L": "STAINLESS_STEEL_316",
        "ASTM A312 TP316L": "STAINLESS_STEEL_316",
        "AISI 316": "STAINLESS_STEEL_316",
        "AISI 316L": "STAINLESS_STEEL_316",
        "SUS 316": "STAINLESS_STEEL_316",
        
        # Stainless Steel 304 / 304L (Standard 18/8 austenitic)
        "SS 304 / ASTM A182 F304": "STAINLESS_STEEL_304",
        "SS 304": "STAINLESS_STEEL_304",
        "SS304": "STAINLESS_STEEL_304",
        "SS 304L": "STAINLESS_STEEL_304",
        "SS304L": "STAINLESS_STEEL_304",
        "ASTM A182 F304": "STAINLESS_STEEL_304",
        "ASTM A182 F304L": "STAINLESS_STEEL_304",
        "AISI 304": "STAINLESS_STEEL_304",
        "AISI 304L": "STAINLESS_STEEL_304",
        "SUS 304": "STAINLESS_STEEL_304",
        
        # Duplex Stainless Steel
        "DUPLEX 2205": "DUPLEX_STEEL",
        "SUPER DUPLEX 2507": "DUPLEX_STEEL",
        "UNS S31803": "DUPLEX_STEEL",
        
        # Nickel & Special Alloys
        "INCONEL 625": "NICKEL_ALLOY",
        "INCONEL 718": "NICKEL_ALLOY",
        "MONEL 400": "NICKEL_ALLOY",
        "HASTELLOY C276": "NICKEL_ALLOY",
        
        # Cast Iron / Bronze
        "CAST IRON": "CAST_IRON",
        "BRONZE": "BRONZE",
        "BRASS": "BRASS"
    }

    @classmethod
    def check_metallurgy_compatibility(cls, raw_grade1: str, raw_grade2: str) -> Tuple[bool, bool, str, float]:
        """
        Returns:
            (is_compatible, is_exact, description, score_weight)
            - is_compatible: True if materials can safely coexist / be merged (e.g. A105 forged vs WCB cast carbon steel)
            - is_exact: True if identical canonical grade
            - description: human-readable explanation
            - score_weight: 1.0 for exact, 0.95 for compatible within family, 0.0 for cross-family contradiction
        """
        if not raw_grade1 or not raw_grade2:
            return True, True, "Neutral (No grade specified)", 1.0

        canon1 = cls.canonicalize_material_grade(raw_grade1)
        canon2 = cls.canonicalize_material_grade(raw_grade2)

        if canon1 == canon2:
            return True, True, f"Identical Grade: {canon1}", 1.0

        fam1 = cls.METALLURGY_FAMILIES.get(canon1) or cls.METALLURGY_FAMILIES.get(str(raw_grade1).strip().upper())
        fam2 = cls.METALLURGY_FAMILIES.get(canon2) or cls.METALLURGY_FAMILIES.get(str(raw_grade2).strip().upper())

        # If both belong to the same metallurgical family (e.g. Carbon Steel forged A105 vs cast A216 WCB)
        if fam1 and fam2 and fam1 == fam2:
            return True, False, f"Compatible Metallurgy ({fam1.replace('_', ' ')}: {raw_grade1} ~ {raw_grade2})", 0.95

        # Cross-family metallurgy contradiction (e.g. Carbon Steel vs Stainless Steel, or SS304 vs SS316)
        hazard_desc = "Critical Metallurgy Contradiction"
        if fam1 and fam2:
            if ("CARBON" in str(fam1) and "STAINLESS" in str(fam2)) or ("CARBON" in str(fam2) and "STAINLESS" in str(fam1)):
                hazard_desc = "Fatal Metallurgy Mismatch: Carbon Steel vs Stainless Steel (Sour Gas Acid Corrosion Risk)"
            elif ("304" in str(fam1) and "316" in str(fam2)) or ("304" in str(fam2) and "316" in str(fam1)):
                hazard_desc = "Metallurgy Mismatch: SS 304 vs SS 316 (Chloride Pitting Corrosion Risk)"
            else:
                hazard_desc = f"Incompatible Alloy Families ({fam1} vs {fam2})"

        return False, False, f"{hazard_desc} ('{raw_grade1}' vs '{raw_grade2}')", 0.0
    
    @classmethod
    def standardize_pressure_rating(cls, pr_str: str) -> str:
        if not pr_str:
            return ""
        cleaned = re.sub(r'[\s\-]+', '', str(pr_str).upper()).strip()
        m = re.match(r'^(?:CLASS|CL|CLS)?\s*(\d+)(?:#|LB|LBS)?$', cleaned)
        if m:
            return f"{m.group(1)}#"
        pn_m = re.match(r'^(?:PN)?\s*(\d+)$', cleaned)
        if "PN" in cleaned and pn_m:
            return f"PN{pn_m.group(1)}"
        return str(pr_str).strip().upper()

