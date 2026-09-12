"""
Candidate Enhanced AI/ML Engine for NUMM
========================================
Implements the 8-Dimension Industrial Physics Safety Matrix,
Fraction & Dimension Tolerance Parser, and Strict Part-Number Guardrails.
"""

import math
import re
from collections import Counter
from typing import List, Dict, Any, Tuple, Optional
from app.models.enums import RelationshipType
from app.core.config import settings

class EnhancedNormalizationService:
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
        "GT": "GATE",
        "BL": "BALL",
        "GL": "GLOBE",
        "CHK": "CHECK",
        "FLG": "FLANGE",
        "GSKT": "GASKET",
        "SPWD": "SPIRAL WOUND",
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
        "QTY": "QUANTITY"
    }

    UOM_DICT: Dict[str, str] = {
        "NOS": "EA", "NO": "EA", "NOS.": "EA", "NUMBER": "EA", "NUMBERS": "EA",
        "EACH": "EA", "EA": "EA", "PC": "EA", "PCS": "EA", "PIECE": "EA", "PIECES": "EA",
        "MTR": "MTR", "M": "MTR", "METER": "MTR", "METERS": "MTR",
        "KG": "KG", "KGS": "KG", "KILOGRAM": "KG", "KILOGRAMS": "KG",
        "SET": "SET", "SETS": "SET", "LOT": "LOT", "LTR": "LTR", "LITRE": "LTR",
        "LITRES": "LTR", "BOX": "BOX", "ROLL": "ROLL"
    }

    DIMENSION_INCH_MAP: Dict[str, str] = {
        '1/4"': '1/4 INCH (DN8)', '1/4IN': '1/4 INCH (DN8)', '1/4 INCH': '1/4 INCH (DN8)', '8MM': '1/4 INCH (DN8)', 'DN8': '1/4 INCH (DN8)', 'DN 8': '1/4 INCH (DN8)',
        '3/8"': '3/8 INCH (DN10)', '3/8IN': '3/8 INCH (DN10)', '3/8 INCH': '3/8 INCH (DN10)', '10MM': '3/8 INCH (DN10)', 'DN10': '3/8 INCH (DN10)', 'DN 10': '3/8 INCH (DN10)',
        '1/2"': '1/2 INCH (DN15)', '1/2IN': '1/2 INCH (DN15)', '1/2 INCH': '1/2 INCH (DN15)', '15MM': '1/2 INCH (DN15)', 'DN15': '1/2 INCH (DN15)', 'DN 15': '1/2 INCH (DN15)',
        '3/4"': '3/4 INCH (DN20)', '3/4IN': '3/4 INCH (DN20)', '3/4 INCH': '3/4 INCH (DN20)', '20MM': '3/4 INCH (DN20)', 'DN20': '3/4 INCH (DN20)', 'DN 20': '3/4 INCH (DN20)',
        '1"': '1 INCH (DN25)', '1IN': '1 INCH (DN25)', '1 INCH': '1 INCH (DN25)', '25MM': '1 INCH (DN25)', 'DN25': '1 INCH (DN25)', 'DN 25': '1 INCH (DN25)',
        '1-1/4"': '1-1/4 INCH (DN32)', '1 1/4"': '1-1/4 INCH (DN32)', '1.25"': '1-1/4 INCH (DN32)', '1-1/4IN': '1-1/4 INCH (DN32)', '1.25IN': '1-1/4 INCH (DN32)', '32MM': '1-1/4 INCH (DN32)', 'DN32': '1-1/4 INCH (DN32)', 'DN 32': '1-1/4 INCH (DN32)',
        '1-1/2"': '1-1/2 INCH (DN40)', '1 1/2"': '1-1/2 INCH (DN40)', '1.5"': '1-1/2 INCH (DN40)', '1-1/2IN': '1-1/2 INCH (DN40)', '1.5IN': '1-1/2 INCH (DN40)', '40MM': '1-1/2 INCH (DN40)', 'DN40': '1-1/2 INCH (DN40)', 'DN 40': '1-1/2 INCH (DN40)',
        '2"': '2 INCH (DN50)', '2IN': '2 INCH (DN50)', '2 INCH': '2 INCH (DN50)', '50MM': '2 INCH (DN50)', 'DN50': '2 INCH (DN50)', 'DN 50': '2 INCH (DN50)',
        '2-1/2"': '2-1/2 INCH (DN65)', '2 1/2"': '2-1/2 INCH (DN65)', '2.5"': '2-1/2 INCH (DN65)', '2.5IN': '2-1/2 INCH (DN65)', '65MM': '2-1/2 INCH (DN65)', 'DN65': '2-1/2 INCH (DN65)', 'DN 65': '2-1/2 INCH (DN65)',
        '3"': '3 INCH (DN80)', '3IN': '3 INCH (DN80)', '3 INCH': '3 INCH (DN80)', '80MM': '3 INCH (DN80)', 'DN80': '3 INCH (DN80)', 'DN 80': '3 INCH (DN80)',
        '4"': '4 INCH (DN100)', '4IN': '4 INCH (DN100)', '4 INCH': '4 INCH (DN100)', '100MM': '4 INCH (DN100)', 'DN100': '4 INCH (DN100)', 'DN 100': '4 INCH (DN100)',
        '6"': '6 INCH (DN150)', '6IN': '6 INCH (DN150)', '6 INCH': '6 INCH (DN150)', '150MM': '6 INCH (DN150)', 'DN150': '6 INCH (DN150)', 'DN 150': '6 INCH (DN150)',
        '8"': '8 INCH (DN200)', '8IN': '8 INCH (DN200)', '8 INCH': '8 INCH (DN200)', '200MM': '8 INCH (DN200)', 'DN200': '8 INCH (DN200)', 'DN 200': '8 INCH (DN200)',
        '10"': '10 INCH (DN250)', '10IN': '10 INCH (DN250)', '10 INCH': '10 INCH (DN250)', '250MM': '10 INCH (DN250)', 'DN250': '10 INCH (DN250)', 'DN 250': '10 INCH (DN250)',
        '12"': '12 INCH (DN300)', '12IN': '12 INCH (DN300)', '12 INCH': '12 INCH (DN300)', '300MM': '12 INCH (DN300)', 'DN300': '12 INCH (DN300)', 'DN 300': '12 INCH (DN300)'
    }

    GRADE_ALIAS_MAP: Dict[str, str] = {
        "WCB": "ASTM A216 WCB",
        "A216 WCB": "ASTM A216 WCB",
        "ASTM A216 WCB": "ASTM A216 WCB",
        "CS WCB": "ASTM A216 WCB",
        "A105": "ASTM A105",
        "A105N": "ASTM A105",
        "ASTM A105": "ASTM A105",
        "ASTM A105N": "ASTM A105",
        "FORGED STEEL": "ASTM A105",
        "FORGED STEEL ASTM A105": "ASTM A105",
        "CAST STEEL": "ASTM A216 WCB",
        "CAST STEEL ASTM A216 WCB": "ASTM A216 WCB",
        "LF2": "ASTM A350 LF2",
        "A350 LF2": "ASTM A350 LF2",
        "ASTM A350 LF2": "ASTM A350 LF2",
        "SS316": "SS 316 / ASTM A182 F316",
        "SS 316": "SS 316 / ASTM A182 F316",
        "SS316L": "SS 316 / ASTM A182 F316",
        "SS 316L": "SS 316 / ASTM A182 F316",
        "AISI 316": "SS 316 / ASTM A182 F316",
        "ASTM A182 F316": "SS 316 / ASTM A182 F316",
        "F316": "SS 316 / ASTM A182 F316",
        "SS304": "SS 304 / ASTM A182 F304",
        "SS 304": "SS 304 / ASTM A182 F304",
        "SS304L": "SS 304 / ASTM A182 F304",
        "ASTM A182 F304": "SS 304 / ASTM A182 F304",
        "B7": "ASTM A193 B7",
        "ASTM A193 B7": "ASTM A193 B7",
        "B8M": "ASTM A193 B8M (SS)",
        "ASTM A193 B8M": "ASTM A193 B8M (SS)",
        "STAINLESS STEEL": "STAINLESS STEEL",
        "CARBON STEEL": "CARBON STEEL",
        "CAST IRON": "CAST IRON",
        "BRONZE": "BRONZE",
        "BRASS": "BRASS"
    }

    PRESSURE_RATINGS_STANDARD: Dict[str, str] = {
        "150": "150#", "150#": "150#", "150LB": "150#", "150LBS": "150#", "CLASS150": "150#", "CL150": "150#",
        "300": "300#", "300#": "300#", "300LB": "300#", "300LBS": "300#", "CLASS300": "300#", "CL300": "300#",
        "600": "600#", "600#": "600#", "600LB": "600#", "600LBS": "600#", "CLASS600": "600#", "CL600": "600#",
        "800": "800#", "800#": "800#", "800LB": "800#", "800LBS": "800#", "CLASS800": "800#",
        "900": "900#", "900#": "900#", "900LB": "900#", "900LBS": "900#", "CLASS900": "900#", "CL900": "900#",
        "1500": "1500#", "1500#": "1500#", "1500LB": "1500#", "1500LBS": "1500#", "CLASS1500": "1500#",
        "2500": "2500#", "2500#": "2500#", "2500LB": "2500#", "2500LBS": "2500#", "CLASS2500": "2500#",
        "PN10": "PN 10", "PN16": "PN 16", "PN25": "PN 25", "PN40": "PN 40", "PN64": "PN 64", "PN100": "PN 100",
        "3000PSI": "3000#", "6000PSI": "6000#", "3000#": "3000#", "6000#": "6000#"
    }

    @classmethod
    def normalize_text(cls, text: str) -> str:
        if not text:
            return ""
        normalized = text.upper()
        normalized = re.sub(r'[\r\n\t]+', ' ', normalized)
        # Preserve hyphens, slashes, and quotes for fractions and part numbers; replace commas, colons, semicolons
        normalized = re.sub(r'[,;:|]+', ' ', normalized)
        tokens = normalized.split()
        expanded_tokens = []
        for token in tokens:
            token_clean = re.sub(r'[^A-Z0-9\"#./\-]', '', token)
            if token_clean in cls.ABBREVIATION_DICT:
                expanded_tokens.append(cls.ABBREVIATION_DICT[token_clean])
            else:
                expanded_tokens.append(token)
        cleaned = " ".join(expanded_tokens)
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
        # Clean spacing around fraction: e.g. 1 - 1/2" -> 1-1/2"
        cleaned = re.sub(r'\s*-\s*', '-', dim_text.strip().upper())
        cleaned_no_space = cleaned.replace(" ", "")
        for k, v in cls.DIMENSION_INCH_MAP.items():
            if k.replace(" ", "") == cleaned_no_space or k == cleaned:
                return v
        return dim_text.strip().upper()

    @classmethod
    def canonicalize_material_grade(cls, grade_str: str) -> str:
        if not grade_str:
            return ""
        cleaned = re.sub(r'[\s\-_]+', ' ', str(grade_str).upper()).strip()
        if cleaned in cls.GRADE_ALIAS_MAP:
            return cls.GRADE_ALIAS_MAP[cleaned]
        for k, v in cls.GRADE_ALIAS_MAP.items():
            if k in cleaned:
                return v
        return cleaned

    @classmethod
    def standardize_pressure_rating(cls, pr_str: str) -> str:
        if not pr_str:
            return ""
        cleaned = re.sub(r'[\s\-]+', '', str(pr_str).upper()).strip()
        return cls.PRESSURE_RATINGS_STANDARD.get(cleaned, str(pr_str).strip().upper())


class EnhancedAttributeExtractor:
    NOUN_PATTERNS = [
        r"\b(BALL VALVE|GATE VALVE|GLOBE VALVE|CHECK VALVE|BUTTERFLY VALVE|PLUG VALVE|NEEDLE VALVE|CONTROL VALVE|RELIEF VALVE|SAFETY VALVE)\b",
        r"\b(VALVE)\b",
        r"\b(WELD NECK FLANGE|BLIND FLANGE|SLIP ON FLANGE|SOCKET WELD FLANGE|THREADED FLANGE|LAP JOINT FLANGE)\b",
        r"\b(FLANGE)\b",
        r"\b(SEAMLESS PIPE|ERW PIPE|WELDED PIPE|LINE PIPE|CASING PIPE|TUBING PIPE)\b",
        r"\b(PIPE)\b",
        r"\b(SPIRAL WOUND GASKET|RING JOINT GASKET|FLAT GASKET|RTJ GASKET)\b",
        r"\b(GASKET)\b",
        r"\b(EQUAL TEE|REDUCING TEE|TEE|ELBOW|REDUCER|COUPLING|NIPPLE|CAP|UNION|BEND)\b",
        r"\b(STUD BOLT|HEX BOLT|BOLT|STUD|NUT|WASHER|FASTENER)\b",
        r"\b(PRESSURE TRANSMITTER|TRANSMITTER|CENTRIFUGAL PUMP|PUMP|COMPRESSOR|MOTOR)\b",
        r"\b(BALL BEARING|DEEP GROOVE BALL BEARING|TAPERED ROLLER BEARING|BEARING|SEAL)\b"
    ]

    MODIFIER_PATTERNS = [
        r"\b(BALL|GATE|GLOBE|CHECK|BUTTERFLY|NEEDLE|PLUG)\b",
        r"\b(WELD NECK|BLIND|SLIP ON|SOCKET WELD|THREADED|LAP JOINT)\b",
        r"\b(SPIRAL WOUND|RING JOINT|COMPRESSED ASBESTOS|NON ASBESTOS)\b",
        r"\b(SEAMLESS|WELDED|ERW|SAW)\b",
        r"\b(EQUAL|REDUCING|CONCENTRIC|ECCENTRIC)\b",
        r"\b(DEEP GROOVE|TAPERED ROLLER)\b"
    ]

    DIMENSION_PATTERNS = [
        r"\b(\d+(?:\.\d+)?\s*MM\s*X\s*\d+(?:\.\d+)?\s*MM(?:\s*X\s*\d+(?:\.\d+)?\s*MM)?)\b",
        r"\b(\d+[\s\-]+\d+/\d+\"\s*|\d+/\d+\"\s*|\d+(?:\.\d+)?\"\s*|\d+(?:\.\d+)?\s*(?:INCH|IN|NB))\b",
        r"\b(DN\s*\d+)\b",
        r"\b(\d+(?:\.\d+)?\s*MM)\b",
        r"\b(\d+/\d+\"\s*X\s*\d+\")\b"
    ]

    MATERIAL_GRADE_PATTERNS = [
        r"\b(SS\s*316L|SS316L|SS\s*316|SS316|AISI\s*316|SUS\s*316)\b",
        r"\b(SS\s*304L|SS304L|SS\s*304|SS304|AISI\s*304)\b",
        r"\b(ASTM\s*A105N|ASTM\s*A105|A105N|A105|ASTM\s*A216\s*WCB|A216\s*WCB|WCB|FORGED STEEL|CAST STEEL)\b",
        r"\b(ASTM\s*A350\s*LF2|A350\s*LF2|LF2)\b",
        r"\b(ASTM\s*A182\s*F316L|F316L|F316|F304L|F304)\b",
        r"\b(ASTM\s*A193\s*B7|A193\s*B7|B7|ASTM\s*A193\s*B8M|B8M)\b",
        r"\b(INCONEL\s*625|MONEL\s*400|HASTELLOY\s*C276|DUPLEX\s*2205)\b",
        r"\b(STAINLESS STEEL|CARBON STEEL|CAST IRON|BRONZE|BRASS)\b"
    ]

    PRESSURE_RATING_PATTERNS = [
        r"(?:^|[\s,;(/])(150#|300#|600#|800#|900#|1500#|2500#)(?:[\s,;)/]|$)",
        r"\b(CLASS\s*(?:150|300|600|800|900|1500|2500))\b",
        r"\b((?:150|300|600|800|900|1500|2500)\s*LB[S]?)\b",
        r"\b(PN\s*(?:10|16|25|40|64|100))\b",
        r"\b(3000\s*PSI|6000\s*PSI)\b",
        r"(?:^|[\s,;(/])(3000#|6000#)(?:[\s,;)/]|$)"
    ]

    FLANGE_FACING_PATTERNS = [
        r"\b(RTJ|RING TYPE JOINT)\b",
        r"\b(FF|FLAT FACE)\b",
        r"\b(RF|RAISED FACE)\b"
    ]

    SCHEDULE_PATTERNS = [
        r"\b(?:SCH|SCHEDULE)\s*(10|20|30|40|60|80|120|160|STD|XS|XXS)\b"
    ]

    HAZARDOUS_CERT_PATTERNS = [
        r"\b(INTRINSICALLY\s*SAFE|EX[\s\-]*IA|EXIA|ZONE\s*0)\b",
        r"\b(FLAMEPROOF|EX[\s\-]*D|EXD|ZONE\s*1)\b"
    ]

    SOUR_SERVICE_PATTERNS = [
        r"\b(NON[\s\-]*SOUR|STANDARD\s*SERVICE|NON SOUR STANDARD)\b",
        r"\b(NACE\s*MR0175|MR0175|MR0103|NACE|SOUR SERVICE|SOUR)\b"
    ]

    PART_NUMBER_PATTERNS = [
        r"\b([0-9]{4,5}[\s\-]+(?:2RS[0-9]?|ZZ|RS|2Z|Z|RS1|2RS1))\b",
        r"\b(322[0-9]{2}|323[0-9]{2}|62[0-9]{2}|63[0-9]{2})\b"
    ]

    @classmethod
    def extract_attributes(cls, text: str, spec_text: Optional[str] = None) -> Dict[str, Any]:
        combined = f"{text} {spec_text}" if spec_text else text
        normalized = EnhancedNormalizationService.normalize_text(combined)

        noun = None
        for pattern in cls.NOUN_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                noun = m.group(1).strip()
                break

        modifier = None
        for pattern in cls.MODIFIER_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                modifier = m.group(1).strip()
                break

        dimensions = None
        for pattern in cls.DIMENSION_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_dim = m.group(1).strip()
                dimensions = EnhancedNormalizationService.standardize_dimension(raw_dim)
                break

        material_grade = None
        for pattern in cls.MATERIAL_GRADE_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_grade = m.group(1).strip()
                material_grade = EnhancedNormalizationService.canonicalize_material_grade(raw_grade)
                break

        pressure_rating = None
        for pattern in cls.PRESSURE_RATING_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_pr = m.group(1).strip()
                pressure_rating = EnhancedNormalizationService.standardize_pressure_rating(raw_pr)
                break

        flange_facing = None
        for pattern in cls.FLANGE_FACING_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_f = m.group(1).upper()
                if "RTJ" in raw_f or "RING" in raw_f:
                    flange_facing = "RTJ"
                elif "FF" in raw_f or "FLAT" in raw_f:
                    flange_facing = "FF"
                else:
                    flange_facing = "RF"
                break

        sour_service = None
        # Check NON-SOUR first so that "NON-SOUR" is not captured by "SOUR"
        m_non = re.search(cls.SOUR_SERVICE_PATTERNS[0], normalized, re.IGNORECASE)
        if m_non:
            sour_service = "NON-SOUR"
        else:
            m_sour = re.search(cls.SOUR_SERVICE_PATTERNS[1], normalized, re.IGNORECASE)
            if m_sour:
                sour_service = "NACE MR0175"

        schedule = None
        m_sch = re.search(cls.SCHEDULE_PATTERNS[0], normalized, re.IGNORECASE)
        if m_sch:
            schedule = f"SCH {m_sch.group(1).upper()}"

        hazardous_cert = None
        m_haz_ia = re.search(cls.HAZARDOUS_CERT_PATTERNS[0], normalized, re.IGNORECASE)
        if m_haz_ia:
            hazardous_cert = "EX-IA"
        else:
            m_haz_d = re.search(cls.HAZARDOUS_CERT_PATTERNS[1], normalized, re.IGNORECASE)
            if m_haz_d:
                hazardous_cert = "EX-D"

        part_number = None
        for pattern in cls.PART_NUMBER_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_pn = m.group(1).upper().strip()
                # Standardize hyphen: e.g. 6205 2RS -> 6205-2RS
                part_number = re.sub(r'[\s\-]+', '-', raw_pn)
                break

        return {
            "noun": noun,
            "modifier": modifier,
            "dimensions": dimensions,
            "material_grade": material_grade,
            "pressure_rating": pressure_rating,
            "flange_facing": flange_facing,
            "sour_service": sour_service,
            "schedule": schedule,
            "hazardous_cert": hazardous_cert,
            "part_number": part_number
        }


class EnhancedMatchingEngine:
    """8-Dimension Industrial Physics Safety Matching Engine."""

    @staticmethod
    def tokenize(text: str) -> List[str]:
        cleaned = re.sub(r'[^A-Z0-9\"#./\-]', ' ', text.upper())
        return [w for w in cleaned.split() if len(w) > 1]

    @classmethod
    def calculate_lexical_similarity(cls, tokens1: List[str], tokens2: List[str]) -> float:
        if not tokens1 or not tokens2:
            return 0.0
        set1, set2 = set(tokens1), set(tokens2)
        inter = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return inter / union if union > 0 else 0.0

    @classmethod
    def evaluate_attributes_8d(
        cls,
        attr1: Dict[str, Any],
        attr2: Dict[str, Any]
    ) -> Tuple[float, List[str], List[str], bool]:
        matches = []
        conflicts = []
        has_critical_conflict = False

        checked = 0
        agreed = 0

        # Dimension 1: Pressure Rating (Hard Conflict)
        pr1 = attr1.get("pressure_rating")
        pr2 = attr2.get("pressure_rating")
        if pr1 and pr2:
            checked += 1
            if pr1 == pr2:
                agreed += 1
                matches.append(f"pressure_rating: {pr1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in pressure_rating: '{pr1}' vs '{pr2}'")
                has_critical_conflict = True

        # Dimension 2: Flange Facing (Hard Conflict: RF vs RTJ vs FF)
        ff1 = attr1.get("flange_facing")
        ff2 = attr2.get("flange_facing")
        if ff1 and ff2:
            checked += 1
            if ff1 == ff2:
                agreed += 1
                matches.append(f"flange_facing: {ff1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in flange_facing: '{ff1}' vs '{ff2}'")
                has_critical_conflict = True

        # Dimension 3: Metallurgy & Sour Service (NACE MR0175 vs Non-Sour)
        ss1 = attr1.get("sour_service")
        ss2 = attr2.get("sour_service")
        if ss1 and ss2:
            checked += 1
            if ss1 == ss2:
                agreed += 1
                matches.append(f"sour_service: {ss1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in sour_service: '{ss1}' vs '{ss2}'")
                has_critical_conflict = True

        # Dimension 4: Material Grade
        mg1 = attr1.get("material_grade")
        mg2 = attr2.get("material_grade")
        if mg1 and mg2:
            checked += 1
            # Check compatible equivalents (e.g. A105 forging vs A216 WCB casting carbon steel, SS316 vs STAINLESS STEEL)
            is_cs_pair = ("CARBON STEEL" in mg1 or "A105" in mg1 or "WCB" in mg1) and \
                         ("CARBON STEEL" in mg2 or "A105" in mg2 or "WCB" in mg2)
            is_ss_pair = ("316" in mg1 or "STAINLESS" in mg1) and ("316" in mg2 or "STAINLESS" in mg2)
            if mg1 == mg2 or is_cs_pair or is_ss_pair:
                agreed += 1
                matches.append(f"material_grade: {mg1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in material_grade: '{mg1}' vs '{mg2}'")
                has_critical_conflict = True

        # Dimension 5: Schedule / Wall Thickness
        sch1 = attr1.get("schedule")
        sch2 = attr2.get("schedule")
        if sch1 and sch2:
            checked += 1
            if sch1 == sch2:
                agreed += 1
                matches.append(f"schedule: {sch1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in schedule: '{sch1}' vs '{sch2}'")
                has_critical_conflict = True

        # Dimension 6: Hazardous Area Protection (Ex-d vs Ex-ia)
        haz1 = attr1.get("hazardous_cert")
        haz2 = attr2.get("hazardous_cert")
        if haz1 and haz2:
            checked += 1
            if haz1 == haz2:
                agreed += 1
                matches.append(f"hazardous_cert: {haz1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in hazardous_cert: '{haz1}' vs '{haz2}'")
                has_critical_conflict = True

        # Dimension 7: Alphanumeric Part Number (e.g. 6205-2RS vs 6205-ZZ)
        pn1 = attr1.get("part_number")
        pn2 = attr2.get("part_number")
        if pn1 and pn2:
            checked += 1
            if pn1 == pn2:
                agreed += 1
                matches.append(f"part_number: {pn1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in part_number: '{pn1}' vs '{pn2}'")
                has_critical_conflict = True

        # Dimension 8: Nominal Bore & Dimensions
        dim1 = attr1.get("dimensions")
        dim2 = attr2.get("dimensions")
        if dim1 and dim2:
            checked += 1
            if dim1 == dim2:
                agreed += 1
                matches.append(f"dimensions: {dim1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in dimensions: '{dim1}' vs '{dim2}'")
                has_critical_conflict = True

        # Noun & Modifier verification
        noun1 = attr1.get("noun")
        noun2 = attr2.get("noun")
        if noun1 and noun2:
            checked += 1
            if noun1.upper() == noun2.upper() or (noun1.upper() in noun2.upper()) or (noun2.upper() in noun1.upper()):
                agreed += 1
                matches.append(f"noun: {noun1}")
            else:
                conflicts.append(f"noun mismatch: '{noun1}' vs '{noun2}'")

        attr_score = (agreed / checked) if checked > 0 else 0.5
        return attr_score, matches, conflicts, has_critical_conflict

    @classmethod
    def match_records(
        cls,
        record1: Dict[str, Any],
        record2: Dict[str, Any]
    ) -> Dict[str, Any]:
        text1 = record1.get("normalized_description") or EnhancedNormalizationService.normalize_text(record1.get("source_description", ""))
        text2 = record2.get("normalized_description") or EnhancedNormalizationService.normalize_text(record2.get("source_description", ""))

        tokens1 = cls.tokenize(text1)
        tokens2 = cls.tokenize(text2)
        lexical = cls.calculate_lexical_similarity(tokens1, tokens2)

        # Dense vector similarity
        semantic = 0.0
        try:
            from app.services.vector_search import VectorSearchService
            semantic = VectorSearchService.get_instance().calculate_pairwise_similarity(text1, text2)
        except Exception:
            inter = len(set(tokens1) & set(tokens2))
            union = len(set(tokens1) | set(tokens2))
            semantic = (inter / union) if union > 0 else 0.0

        attr1 = record1.get("attributes", {})
        attr2 = record2.get("attributes", {})
        attr_score, matches, conflicts, has_critical_conflict = cls.evaluate_attributes_8d(attr1, attr2)

        uom1 = EnhancedNormalizationService.normalize_uom(record1.get("source_uom", ""))
        uom2 = EnhancedNormalizationService.normalize_uom(record2.get("source_uom", ""))
        uom_score = 1.0 if uom1 == uom2 else 0.0

        raw_composite = (
            (settings.MATCHING_SEMANTIC_WEIGHT * semantic) +
            (settings.MATCHING_LEXICAL_WEIGHT * lexical) +
            (settings.MATCHING_ATTRIBUTE_WEIGHT * attr_score) +
            (settings.MATCHING_UOM_WEIGHT * uom_score)
        )
        raw_composite = round(raw_composite, 4)

        if has_critical_conflict:
            # Strict Industrial Cap: Demote and Hard Cap at <= 0.60
            composite_score = round(min(0.60, raw_composite * 0.65), 4)
            rel_type = RelationshipType.RELATED
        else:
            composite_score = raw_composite
            if attr_score >= 0.80:
                # Strong physical parity boost for conflict-free industrial equivalents
                composite_score = round(max(raw_composite, min(0.95, 0.68 + (0.22 * attr_score) + (0.10 * lexical))), 4)

            if composite_score >= settings.IDENTICAL_THRESHOLD and attr_score >= 0.75:
                if record1.get("cpse_id") == record2.get("cpse_id"):
                    rel_type = RelationshipType.DUPLICATE
                else:
                    rel_type = RelationshipType.IDENTICAL
            elif composite_score >= settings.NEAR_DUPLICATE_THRESHOLD:
                rel_type = RelationshipType.NEAR_DUPLICATE
            elif composite_score >= settings.RELATED_THRESHOLD:
                rel_type = RelationshipType.RELATED
            else:
                rel_type = RelationshipType.RELATED

        return {
            "relationship_type": rel_type,
            "confidence_score": composite_score,
            "lexical_score": round(lexical, 4),
            "semantic_score": round(semantic, 4),
            "attribute_score": round(attr_score, 4),
            "matches": matches,
            "conflicts": conflicts,
            "has_critical_conflict": has_critical_conflict
        }


# Code templates to deploy directly to backend services when benchmark passes
ENHANCED_NORMALIZATION_CODE = '''import re
from typing import Dict

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
        "GT": "GATE",
        "BL": "BALL",
        "GL": "GLOBE",
        "CHK": "CHECK",
        "FLG": "FLANGE",
        "GSKT": "GASKET",
        "SPWD": "SPIRAL WOUND",
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
        "QTY": "QUANTITY"
    }

    UOM_DICT: Dict[str, str] = {
        "NOS": "EA", "NO": "EA", "NOS.": "EA", "NUMBER": "EA", "NUMBERS": "EA",
        "EACH": "EA", "EA": "EA", "PC": "EA", "PCS": "EA", "PIECE": "EA", "PIECES": "EA",
        "MTR": "MTR", "M": "MTR", "METER": "MTR", "METERS": "MTR",
        "KG": "KG", "KGS": "KG", "KILOGRAM": "KG", "KILOGRAMS": "KG",
        "SET": "SET", "SETS": "SET", "LOT": "LOT", "LTR": "LTR", "LITRE": "LTR",
        "LITRES": "LTR", "BOX": "BOX", "ROLL": "ROLL"
    }

    DIMENSION_INCH_MAP: Dict[str, str] = {
        '1/4"': '1/4 INCH (DN8)', '1/4IN': '1/4 INCH (DN8)', '1/4 INCH': '1/4 INCH (DN8)', '8MM': '1/4 INCH (DN8)', 'DN8': '1/4 INCH (DN8)', 'DN 8': '1/4 INCH (DN8)',
        '3/8"': '3/8 INCH (DN10)', '3/8IN': '3/8 INCH (DN10)', '3/8 INCH': '3/8 INCH (DN10)', '10MM': '3/8 INCH (DN10)', 'DN10': '3/8 INCH (DN10)', 'DN 10': '3/8 INCH (DN10)',
        '1/2"': '1/2 INCH (DN15)', '1/2IN': '1/2 INCH (DN15)', '1/2 INCH': '1/2 INCH (DN15)', '15MM': '1/2 INCH (DN15)', 'DN15': '1/2 INCH (DN15)', 'DN 15': '1/2 INCH (DN15)',
        '3/4"': '3/4 INCH (DN20)', '3/4IN': '3/4 INCH (DN20)', '3/4 INCH': '3/4 INCH (DN20)', '20MM': '3/4 INCH (DN20)', 'DN20': '3/4 INCH (DN20)', 'DN 20': '3/4 INCH (DN20)',
        '1"': '1 INCH (DN25)', '1IN': '1 INCH (DN25)', '1 INCH': '1 INCH (DN25)', '25MM': '1 INCH (DN25)', 'DN25': '1 INCH (DN25)', 'DN 25': '1 INCH (DN25)',
        '1-1/4"': '1-1/4 INCH (DN32)', '1 1/4"': '1-1/4 INCH (DN32)', '1.25"': '1-1/4 INCH (DN32)', '1-1/4IN': '1-1/4 INCH (DN32)', '1.25IN': '1-1/4 INCH (DN32)', '32MM': '1-1/4 INCH (DN32)', 'DN32': '1-1/4 INCH (DN32)', 'DN 32': '1-1/4 INCH (DN32)',
        '1-1/2"': '1-1/2 INCH (DN40)', '1 1/2"': '1-1/2 INCH (DN40)', '1.5"': '1-1/2 INCH (DN40)', '1-1/2IN': '1-1/2 INCH (DN40)', '1.5IN': '1-1/2 INCH (DN40)', '40MM': '1-1/2 INCH (DN40)', 'DN40': '1-1/2 INCH (DN40)', 'DN 40': '1-1/2 INCH (DN40)',
        '2"': '2 INCH (DN50)', '2IN': '2 INCH (DN50)', '2 INCH': '2 INCH (DN50)', '50MM': '2 INCH (DN50)', 'DN50': '2 INCH (DN50)', 'DN 50': '2 INCH (DN50)',
        '2-1/2"': '2-1/2 INCH (DN65)', '2 1/2"': '2-1/2 INCH (DN65)', '2.5"': '2-1/2 INCH (DN65)', '2.5IN': '2-1/2 INCH (DN65)', '65MM': '2-1/2 INCH (DN65)', 'DN65': '2-1/2 INCH (DN65)', 'DN 65': '2-1/2 INCH (DN65)',
        '3"': '3 INCH (DN80)', '3IN': '3 INCH (DN80)', '3 INCH': '3 INCH (DN80)', '80MM': '3 INCH (DN80)', 'DN80': '3 INCH (DN80)', 'DN 80': '3 INCH (DN80)',
        '4"': '4 INCH (DN100)', '4IN': '4 INCH (DN100)', '4 INCH': '4 INCH (DN100)', '100MM': '4 INCH (DN100)', 'DN100': '4 INCH (DN100)', 'DN 100': '4 INCH (DN100)',
        '6"': '6 INCH (DN150)', '6IN': '6 INCH (DN150)', '6 INCH': '6 INCH (DN150)', '150MM': '6 INCH (DN150)', 'DN150': '6 INCH (DN150)', 'DN 150': '6 INCH (DN150)',
        '8"': '8 INCH (DN200)', '8IN': '8 INCH (DN200)', '8 INCH': '8 INCH (DN200)', '200MM': '8 INCH (DN200)', 'DN200': '8 INCH (DN200)', 'DN 200': '8 INCH (DN200)',
        '10"': '10 INCH (DN250)', '10IN': '10 INCH (DN250)', '10 INCH': '10 INCH (DN250)', '250MM': '10 INCH (DN250)', 'DN250': '10 INCH (DN250)', 'DN 250': '10 INCH (DN250)',
        '12"': '12 INCH (DN300)', '12IN': '12 INCH (DN300)', '12 INCH': '12 INCH (DN300)', '300MM': '12 INCH (DN300)', 'DN300': '12 INCH (DN300)', 'DN 300': '12 INCH (DN300)'
    }

    GRADE_ALIAS_MAP: Dict[str, str] = {
        "WCB": "ASTM A216 WCB",
        "A216 WCB": "ASTM A216 WCB",
        "ASTM A216 WCB": "ASTM A216 WCB",
        "CS WCB": "ASTM A216 WCB",
        "A105": "ASTM A105",
        "A105N": "ASTM A105",
        "ASTM A105": "ASTM A105",
        "ASTM A105N": "ASTM A105",
        "FORGED STEEL": "ASTM A105",
        "FORGED STEEL ASTM A105": "ASTM A105",
        "CAST STEEL": "ASTM A216 WCB",
        "CAST STEEL ASTM A216 WCB": "ASTM A216 WCB",
        "LF2": "ASTM A350 LF2",
        "A350 LF2": "ASTM A350 LF2",
        "ASTM A350 LF2": "ASTM A350 LF2",
        "SS316": "SS 316 / ASTM A182 F316",
        "SS 316": "SS 316 / ASTM A182 F316",
        "SS316L": "SS 316 / ASTM A182 F316",
        "SS 316L": "SS 316 / ASTM A182 F316",
        "AISI 316": "SS 316 / ASTM A182 F316",
        "ASTM A182 F316": "SS 316 / ASTM A182 F316",
        "F316": "SS 316 / ASTM A182 F316",
        "SS304": "SS 304 / ASTM A182 F304",
        "SS 304": "SS 304 / ASTM A182 F304",
        "SS304L": "SS 304 / ASTM A182 F304",
        "ASTM A182 F304": "SS 304 / ASTM A182 F304",
        "B7": "ASTM A193 B7",
        "ASTM A193 B7": "ASTM A193 B7",
        "B8M": "ASTM A193 B8M (SS)",
        "ASTM A193 B8M": "ASTM A193 B8M (SS)",
        "STAINLESS STEEL": "STAINLESS STEEL",
        "CARBON STEEL": "CARBON STEEL",
        "CAST IRON": "CAST IRON",
        "BRONZE": "BRONZE",
        "BRASS": "BRASS"
    }

    PRESSURE_RATINGS_STANDARD: Dict[str, str] = {
        "150": "150#", "150#": "150#", "150LB": "150#", "150LBS": "150#", "CLASS150": "150#", "CL150": "150#",
        "300": "300#", "300#": "300#", "300LB": "300#", "300LBS": "300#", "CLASS300": "300#", "CL300": "300#",
        "600": "600#", "600#": "600#", "600LB": "600#", "600LBS": "600#", "CLASS600": "600#", "CL600": "600#",
        "800": "800#", "800#": "800#", "800LB": "800#", "800LBS": "800#", "CLASS800": "800#",
        "900": "900#", "900#": "900#", "900LB": "900#", "900LBS": "900#", "CLASS900": "900#", "CL900": "900#",
        "1500": "1500#", "1500#": "1500#", "1500LB": "1500#", "1500LBS": "1500#", "CLASS1500": "1500#",
        "2500": "2500#", "2500#": "2500#", "2500LB": "2500#", "2500LBS": "2500#", "CLASS2500": "2500#",
        "PN10": "PN 10", "PN16": "PN 16", "PN25": "PN 25", "PN40": "PN 40", "PN64": "PN 64", "PN100": "PN 100",
        "3000PSI": "3000#", "6000PSI": "6000#", "3000#": "3000#", "6000#": "6000#"
    }

    @classmethod
    def normalize_text(cls, text: str) -> str:
        if not text:
            return ""
        normalized = re.sub(r'\s+', ' ', normalized)
        normalized = re.sub(r'[,;:|]+', ' ', normalized)
        tokens = normalized.split()
        expanded_tokens = []
        for token in tokens:
            token_clean = re.sub(r'[^A-Z0-9\"#./\-]', '', token)
            if token_clean in cls.ABBREVIATION_DICT:
                expanded_tokens.append(cls.ABBREVIATION_DICT[token_clean])
            else:
                expanded_tokens.append(token)
        cleaned = " ".join(expanded_tokens)
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
        cleaned = re.sub(r'\s*-\s*', '-', dim_text.strip().upper())
        cleaned_no_space = cleaned.replace(" ", "")
        for k, v in cls.DIMENSION_INCH_MAP.items():
            if k.replace(" ", "") == cleaned_no_space or k == cleaned:
                return v
        return dim_text.strip().upper()

    @classmethod
    def canonicalize_material_grade(cls, grade_str: str) -> str:
        if not grade_str:
            return ""
        cleaned = re.sub(r'[\s\-_]+', ' ', str(grade_str).upper()).strip()
        if cleaned in cls.GRADE_ALIAS_MAP:
            return cls.GRADE_ALIAS_MAP[cleaned]
        for k, v in cls.GRADE_ALIAS_MAP.items():
            if k in cleaned:
                return v
        return cleaned

    @classmethod
    def standardize_pressure_rating(cls, pr_str: str) -> str:
        if not pr_str:
            return ""
        cleaned = re.sub(r'[\s\-]+', '', str(pr_str).upper()).strip()
        return cls.PRESSURE_RATINGS_STANDARD.get(cleaned, str(pr_str).strip().upper())
'''

ENHANCED_ATTRIBUTE_EXTRACTOR_CODE = '''import re
from typing import Dict, Any, Optional
from app.services.normalization import NormalizationService

class AttributeExtractor:
    NOUN_PATTERNS = [
        r"\\b(BALL VALVE|GATE VALVE|GLOBE VALVE|CHECK VALVE|BUTTERFLY VALVE|PLUG VALVE|NEEDLE VALVE|CONTROL VALVE|RELIEF VALVE|SAFETY VALVE)\\b",
        r"\\b(VALVE)\\b",
        r"\\b(WELD NECK FLANGE|BLIND FLANGE|SLIP ON FLANGE|SOCKET WELD FLANGE|THREADED FLANGE|LAP JOINT FLANGE)\\b",
        r"\\b(FLANGE)\\b",
        r"\\b(SEAMLESS PIPE|ERW PIPE|WELDED PIPE|LINE PIPE|CASING PIPE|TUBING PIPE)\\b",
        r"\\b(PIPE)\\b",
        r"\\b(SPIRAL WOUND GASKET|RING JOINT GASKET|FLAT GASKET|RTJ GASKET)\\b",
        r"\\b(GASKET)\\b",
        r"\\b(EQUAL TEE|REDUCING TEE|TEE|ELBOW|REDUCER|COUPLING|NIPPLE|CAP|UNION|BEND)\\b",
        r"\\b(STUD BOLT|HEX BOLT|BOLT|STUD|NUT|WASHER|FASTENER)\\b",
        r"\\b(PRESSURE TRANSMITTER|TRANSMITTER|CENTRIFUGAL PUMP|PUMP|COMPRESSOR|MOTOR)\\b",
        r"\\b(BALL BEARING|DEEP GROOVE BALL BEARING|TAPERED ROLLER BEARING|BEARING|SEAL)\\b"
    ]

    MODIFIER_PATTERNS = [
        r"\\b(BALL|GATE|GLOBE|CHECK|BUTTERFLY|NEEDLE|PLUG)\\b",
        r"\\b(WELD NECK|BLIND|SLIP ON|SOCKET WELD|THREADED|LAP JOINT)\\b",
        r"\\b(SPIRAL WOUND|RING JOINT|COMPRESSED ASBESTOS|NON ASBESTOS)\\b",
        r"\\b(SEAMLESS|WELDED|ERW|SAW)\\b",
        r"\\b(EQUAL|REDUCING|CONCENTRIC|ECCENTRIC)\\b",
        r"\\b(DEEP GROOVE|TAPERED ROLLER)\\b"
    ]

    DIMENSION_PATTERNS = [
        r"\\b(\\d+(?:\\.\\d+)?\\s*MM\\s*X\\s*\\d+(?:\\.\\d+)?\\s*MM(?:\\s*X\\s*\\d+(?:\\.\\d+)?\\s*MM)?)\\b",
        r"\\b(\\d+[\\s\\-]+\\d+/\\d+\\\"\\s*|\\d+/\\d+\\\"\\s*|\\d+(?:\\.\\d+)?\\\"\\s*|\\d+(?:\\.\\d+)?\\s*(?:INCH|IN|NB))\\b",
        r"\\b(DN\\s*\\d+)\\b",
        r"\\b(\\d+(?:\\.\\d+)?\\s*MM)\\b",
        r"\\b(\\d+/\\d+\\\"\\s*X\\s*\\d+\\\")\\b"
    ]

    MATERIAL_GRADE_PATTERNS = [
        r"\\b(SS\\s*316L|SS316L|SS\\s*316|SS316|AISI\\s*316|SUS\\s*316)\\b",
        r"\\b(SS\\s*304L|SS304L|SS\\s*304|SS304|AISI\\s*304)\\b",
        r"\\b(ASTM\\s*A105N|ASTM\\s*A105|A105N|A105|ASTM\\s*A216\\s*WCB|A216\\s*WCB|WCB|FORGED STEEL|CAST STEEL)\\b",
        r"\\b(ASTM\\s*A350\\s*LF2|A350\\s*LF2|LF2)\\b",
        r"\\b(ASTM\\s*A182\\s*F316L|F316L|F316|F304L|F304)\\b",
        r"\\b(ASTM\\s*A193\\s*B7|A193\\s*B7|B7|ASTM\\s*A193\\s*B8M|B8M)\\b",
        r"\\b(INCONEL\\s*625|MONEL\\s*400|HASTELLOY\\s*C276|DUPLEX\\s*2205)\\b",
        r"\\b(STAINLESS STEEL|CARBON STEEL|CAST IRON|BRONZE|BRASS)\\b"
    ]

    PRESSURE_RATING_PATTERNS = [
        r"(?:^|[\\s,;(/])(150#|300#|600#|800#|900#|1500#|2500#)(?:[\\s,;)/]|$)",
        r"\\b(CLASS\\s*(?:150|300|600|800|900|1500|2500))\\b",
        r"\\b((?:150|300|600|800|900|1500|2500)\\s*LB[S]?)\\b",
        r"\\b(PN\\s*(?:10|16|25|40|64|100))\\b",
        r"\\b(3000\\s*PSI|6000\\s*PSI)\\b",
        r"(?:^|[\\s,;(/])(3000#|6000#)(?:[\\s,;)/]|$)"
    ]

    FLANGE_FACING_PATTERNS = [
        r"\\b(RTJ|RING TYPE JOINT)\\b",
        r"\\b(FF|FLAT FACE)\\b",
        r"\\b(RF|RAISED FACE)\\b"
    ]

    SCHEDULE_PATTERNS = [
        r"\\b(?:SCH|SCHEDULE)\\s*(10|20|30|40|60|80|120|160|STD|XS|XXS)\\b"
    ]

    HAZARDOUS_CERT_PATTERNS = [
        r"\\b(INTRINSICALLY\\s*SAFE|EX[\\s\\-]*IA|EXIA|ZONE\\s*0)\\b",
        r"\\b(FLAMEPROOF|EX[\\s\\-]*D|EXD|ZONE\\s*1)\\b"
    ]

    SOUR_SERVICE_PATTERNS = [
        r"\\b(NON[\\s\\-]*SOUR|STANDARD\\s*SERVICE|NON SOUR STANDARD)\\b",
        r"\\b(NACE\\s*MR0175|MR0175|MR0103|NACE|SOUR SERVICE|SOUR)\\b"
    ]

    PART_NUMBER_PATTERNS = [
        r"\\b([0-9]{4,5}[\\s\\-]+(?:2RS[0-9]?|ZZ|RS|2Z|Z|RS1|2RS1))\\b",
        r"\\b(322[0-9]{2}|323[0-9]{2}|62[0-9]{2}|63[0-9]{2})\\b"
    ]

    @classmethod
    def extract_attributes(cls, text: str, spec_text: Optional[str] = None) -> Dict[str, Any]:
        combined = f"{text} {spec_text}" if spec_text else text
        normalized = NormalizationService.normalize_text(combined)

        noun = None
        for pattern in cls.NOUN_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                noun = m.group(1).strip()
                break

        modifier = None
        for pattern in cls.MODIFIER_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                modifier = m.group(1).strip()
                break

        dimensions = None
        for pattern in cls.DIMENSION_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_dim = m.group(1).strip()
                dimensions = NormalizationService.standardize_dimension(raw_dim)
                break

        material_grade = None
        for pattern in cls.MATERIAL_GRADE_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_grade = m.group(1).strip()
                material_grade = NormalizationService.canonicalize_material_grade(raw_grade)
                break

        pressure_rating = None
        for pattern in cls.PRESSURE_RATING_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_pr = m.group(1).strip()
                pressure_rating = NormalizationService.standardize_pressure_rating(raw_pr)
                break

        flange_facing = None
        for pattern in cls.FLANGE_FACING_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_f = m.group(1).upper()
                if "RTJ" in raw_f or "RING" in raw_f:
                    flange_facing = "RTJ"
                elif "FF" in raw_f or "FLAT" in raw_f:
                    flange_facing = "FF"
                else:
                    flange_facing = "RF"
                break

        sour_service = None
        m_non = re.search(cls.SOUR_SERVICE_PATTERNS[0], normalized, re.IGNORECASE)
        if m_non:
            sour_service = "NON-SOUR"
        else:
            m_sour = re.search(cls.SOUR_SERVICE_PATTERNS[1], normalized, re.IGNORECASE)
            if m_sour:
                sour_service = "NACE MR0175"

        schedule = None
        m_sch = re.search(cls.SCHEDULE_PATTERNS[0], normalized, re.IGNORECASE)
        if m_sch:
            schedule = f"SCH {m_sch.group(1).upper()}"

        hazardous_cert = None
        m_haz_ia = re.search(cls.HAZARDOUS_CERT_PATTERNS[0], normalized, re.IGNORECASE)
        if m_haz_ia:
            hazardous_cert = "EX-IA"
        else:
            m_haz_d = re.search(cls.HAZARDOUS_CERT_PATTERNS[1], normalized, re.IGNORECASE)
            if m_haz_d:
                hazardous_cert = "EX-D"

        part_number = None
        for pattern in cls.PART_NUMBER_PATTERNS:
            m = re.search(pattern, normalized, re.IGNORECASE)
            if m:
                raw_pn = m.group(1).upper().strip()
                part_number = re.sub(r'[\\s\\-]+', '-', raw_pn)
                break

        return {
            "noun": noun,
            "modifier": modifier,
            "dimensions": dimensions,
            "material_grade": material_grade,
            "pressure_rating": pressure_rating,
            "flange_facing": flange_facing,
            "sour_service": sour_service,
            "schedule": schedule,
            "hazardous_cert": hazardous_cert,
            "part_number": part_number
        }
'''

ENHANCED_MATCHING_ENGINE_CODE = '''import math
import re
from collections import Counter
from typing import List, Dict, Any, Tuple
from app.models.enums import RelationshipType
from app.services.normalization import NormalizationService
from app.core.config import settings

class MatchingEngine:
    @staticmethod
    def tokenize(text: str) -> List[str]:
        cleaned = re.sub(r'[^A-Z0-9\"#./\-]', ' ', text.upper())
        return [w for w in cleaned.split() if len(w) > 1]

    @classmethod
    def calculate_lexical_similarity(cls, tokens1: List[str], tokens2: List[str]) -> float:
        if not tokens1 or not tokens2:
            return 0.0
        set1, set2 = set(tokens1), set(tokens2)
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0.0

    @classmethod
    def calculate_cosine_similarity(cls, tokens1: List[str], tokens2: List[str]) -> float:
        if not tokens1 or not tokens2:
            return 0.0
        vec1 = Counter(tokens1)
        vec2 = Counter(tokens2)
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        if not denominator:
            return 0.0
        return float(numerator) / denominator

    @classmethod
    def evaluate_attributes_8d(
        cls,
        attr1: Dict[str, Any],
        attr2: Dict[str, Any]
    ) -> Tuple[float, List[str], List[str], bool]:
        matches = []
        conflicts = []
        has_critical_conflict = False

        checked = 0
        agreed = 0

        # Dimension 1: Pressure Rating (Hard Conflict)
        pr1 = attr1.get("pressure_rating")
        pr2 = attr2.get("pressure_rating")
        if pr1 and pr2:
            checked += 1
            if pr1 == pr2:
                agreed += 1
                matches.append(f"pressure_rating: {pr1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in pressure_rating: '{pr1}' vs '{pr2}'")
                has_critical_conflict = True

        # Dimension 2: Flange Facing (Hard Conflict: RF vs RTJ vs FF)
        ff1 = attr1.get("flange_facing")
        ff2 = attr2.get("flange_facing")
        if ff1 and ff2:
            checked += 1
            if ff1 == ff2:
                agreed += 1
                matches.append(f"flange_facing: {ff1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in flange_facing: '{ff1}' vs '{ff2}'")
                has_critical_conflict = True

        # Dimension 3: Metallurgy & Sour Service (NACE MR0175 vs Non-Sour)
        ss1 = attr1.get("sour_service")
        ss2 = attr2.get("sour_service")
        if ss1 and ss2:
            checked += 1
            if ss1 == ss2:
                agreed += 1
                matches.append(f"sour_service: {ss1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in sour_service: '{ss1}' vs '{ss2}'")
                has_critical_conflict = True

        # Dimension 4: Material Grade
        mg1 = attr1.get("material_grade")
        mg2 = attr2.get("material_grade")
        if mg1 and mg2:
            checked += 1
            is_cs_pair = ("CARBON STEEL" in mg1 or "A105" in mg1 or "WCB" in mg1) and \
                         ("CARBON STEEL" in mg2 or "A105" in mg2 or "WCB" in mg2)
            is_ss_pair = ("316" in mg1 or "STAINLESS" in mg1) and ("316" in mg2 or "STAINLESS" in mg2)
            if mg1 == mg2 or is_cs_pair or is_ss_pair:
                agreed += 1
                matches.append(f"material_grade: {mg1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in material_grade: '{mg1}' vs '{mg2}'")
                has_critical_conflict = True

        # Dimension 5: Schedule / Wall Thickness
        sch1 = attr1.get("schedule")
        sch2 = attr2.get("schedule")
        if sch1 and sch2:
            checked += 1
            if sch1 == sch2:
                agreed += 1
                matches.append(f"schedule: {sch1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in schedule: '{sch1}' vs '{sch2}'")
                has_critical_conflict = True

        # Dimension 6: Hazardous Area Protection (Ex-d vs Ex-ia)
        haz1 = attr1.get("hazardous_cert")
        haz2 = attr2.get("hazardous_cert")
        if haz1 and haz2:
            checked += 1
            if haz1 == haz2:
                agreed += 1
                matches.append(f"hazardous_cert: {haz1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in hazardous_cert: '{haz1}' vs '{haz2}'")
                has_critical_conflict = True

        # Dimension 7: Alphanumeric Part Number (e.g. 6205-2RS vs 6205-ZZ)
        pn1 = attr1.get("part_number")
        pn2 = attr2.get("part_number")
        if pn1 and pn2:
            checked += 1
            if pn1 == pn2:
                agreed += 1
                matches.append(f"part_number: {pn1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in part_number: '{pn1}' vs '{pn2}'")
                has_critical_conflict = True

        # Dimension 8: Nominal Bore & Dimensions
        dim1 = attr1.get("dimensions")
        dim2 = attr2.get("dimensions")
        if dim1 and dim2:
            checked += 1
            if dim1 == dim2:
                agreed += 1
                matches.append(f"dimensions: {dim1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in dimensions: '{dim1}' vs '{dim2}'")
                has_critical_conflict = True

        # Noun & Modifier verification
        noun1 = attr1.get("noun")
        noun2 = attr2.get("noun")
        if noun1 and noun2:
            checked += 1
            if noun1.upper() == noun2.upper() or (noun1.upper() in noun2.upper()) or (noun2.upper() in noun1.upper()):
                agreed += 1
                matches.append(f"noun: {noun1}")
            else:
                conflicts.append(f"noun mismatch: '{noun1}' vs '{noun2}'")

        attr_score = (agreed / checked) if checked > 0 else 0.5
        return attr_score, matches, conflicts, has_critical_conflict

    @classmethod
    def match_records(
        cls,
        record1: Dict[str, Any],
        record2: Dict[str, Any]
    ) -> Dict[str, Any]:
        text1 = record1.get("normalized_description") or NormalizationService.normalize_text(record1.get("source_description", ""))
        text2 = record2.get("normalized_description") or NormalizationService.normalize_text(record2.get("source_description", ""))
        
        tokens1 = cls.tokenize(text1)
        tokens2 = cls.tokenize(text2)
        
        lexical = cls.calculate_lexical_similarity(tokens1, tokens2)

        semantic = 0.0
        try:
            from app.services.vector_search import VectorSearchService
            semantic = VectorSearchService.get_instance().calculate_pairwise_similarity(text1, text2)
        except Exception:
            semantic = cls.calculate_cosine_similarity(tokens1, tokens2)
        
        attr1 = record1.get("attributes", {})
        attr2 = record2.get("attributes", {})
        attr_score, matches, conflicts, has_critical_conflict = cls.evaluate_attributes_8d(attr1, attr2)
        
        uom1 = NormalizationService.normalize_uom(record1.get("source_uom", ""))
        uom2 = NormalizationService.normalize_uom(record2.get("source_uom", ""))
        uom_score = 1.0 if uom1 == uom2 else 0.0
        if uom_score == 0:
            conflicts.append(f"UOM discrepancy: '{uom1}' vs '{uom2}'")

        raw_composite = (
            (settings.MATCHING_SEMANTIC_WEIGHT * semantic) +
            (settings.MATCHING_LEXICAL_WEIGHT * lexical) +
            (settings.MATCHING_ATTRIBUTE_WEIGHT * attr_score) +
            (settings.MATCHING_UOM_WEIGHT * uom_score)
        )
        raw_composite = round(raw_composite, 4)

        if has_critical_conflict:
            # Strict Industrial Cap: Demote and Hard Cap at <= 0.60
            composite_score = round(min(0.60, raw_composite * 0.65), 4)
            rel_type = RelationshipType.RELATED
        else:
            composite_score = raw_composite
            if attr_score >= 0.80:
                # Strong physical parity boost for conflict-free industrial equivalents
                composite_score = round(max(raw_composite, min(0.95, 0.68 + (0.22 * attr_score) + (0.10 * lexical))), 4)

            if composite_score >= settings.IDENTICAL_THRESHOLD and attr_score >= 0.75:
                if record1.get("cpse_id") == record2.get("cpse_id"):
                    rel_type = RelationshipType.DUPLICATE
                else:
                    rel_type = RelationshipType.IDENTICAL
            elif composite_score >= settings.NEAR_DUPLICATE_THRESHOLD:
                rel_type = RelationshipType.NEAR_DUPLICATE
            elif composite_score >= settings.RELATED_THRESHOLD:
                rel_type = RelationshipType.RELATED
            else:
                rel_type = RelationshipType.RELATED

        return {
            "relationship_type": rel_type,
            "confidence_score": composite_score,
            "lexical_score": round(lexical, 4),
            "semantic_score": round(semantic, 4),
            "attribute_score": round(attr_score, 4),
            "matches": matches,
            "conflicts": conflicts,
            "has_critical_conflict": has_critical_conflict
        }

    @classmethod
    def retrieve_candidate_pairs(
        cls,
        materials: List[Dict[str, Any]],
        top_k: int = 10
    ) -> List[Tuple[Dict[str, Any], Dict[str, Any], float]]:
        try:
            from app.services.vector_search import VectorSearchService
            vector_svc = VectorSearchService.get_instance()
            
            index_payload = [
                {"id": m["id"], "text": m.get("normalized_description") or m.get("source_description", "")}
                for m in materials
            ]
            vector_svc.index_materials(index_payload)
            
            mat_by_id = {m["id"]: m for m in materials}
            pairs = []
            seen_pairs = set()

            for m in materials:
                query_text = m.get("normalized_description") or m.get("source_description", "")
                candidates = vector_svc.retrieve_candidates(query_text, k=top_k)
                for c_id, sim in candidates:
                    if c_id == m["id"]:
                        continue
                    pair_key = tuple(sorted([m["id"], c_id]))
                    if pair_key not in seen_pairs and c_id in mat_by_id:
                        seen_pairs.add(pair_key)
                        pairs.append((m, mat_by_id[c_id], sim))

            return pairs
        except Exception:
            pairs = []
            n = len(materials)
            for i in range(n):
                for j in range(i + 1, min(i + top_k + 1, n)):
                    pairs.append((materials[i], materials[j], 0.5))
            return pairs
'''
