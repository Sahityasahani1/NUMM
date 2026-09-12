"""
National Unified Material Master (NUMM) · Industrial Physics Units & Tolerance Engine
Provides continuous SI (mm) unit parsing, numerical tolerance evaluation,
and pressure/standard conversion for oil & gas energy equipment.
"""

import re
from typing import Optional, Tuple, Dict, Any

class PhysicsUnitsEngine:
    # Nominal Pipe Size (NPS in inches) to exact Outside Diameter (OD) and Nominal Diameter (DN in mm)
    NPS_TO_MM: Dict[str, float] = {
        "1/8": 6.0,
        "1/4": 8.0,
        "3/8": 10.0,
        "1/2": 15.0,     # DN15 / ~21.3mm OD
        "3/4": 20.0,     # DN20 / ~26.7mm OD
        "1": 25.0,       # DN25 / ~33.4mm OD
        "1 1/4": 32.0,
        "1 1/2": 40.0,   # DN40 / ~48.3mm OD
        "1.25": 32.0,
        "1.5": 40.0,
        "2": 50.0,       # DN50 / ~60.3mm OD
        "2 1/2": 65.0,   # DN65 / ~73.0mm OD
        "2.5": 65.0,
        "3": 80.0,       # DN80 / ~88.9mm OD
        "3 1/2": 90.0,
        "4": 100.0,      # DN100 / ~114.3mm OD
        "5": 125.0,      # DN125
        "6": 150.0,      # DN150 / ~168.3mm OD
        "8": 200.0,      # DN200 / ~219.1mm OD
        "10": 250.0,     # DN250 / ~273.0mm OD
        "12": 300.0,     # DN300 / ~323.9mm OD
        "14": 350.0,     # DN350 / ~355.6mm OD
        "16": 400.0,     # DN400 / ~406.4mm OD
        "18": 450.0,     # DN450 / ~457.0mm OD
        "20": 500.0,     # DN500 / ~508.0mm OD
        "24": 600.0,     # DN600 / ~610.0mm OD
        "28": 700.0,
        "30": 750.0,
        "32": 800.0,
        "36": 900.0,
        "40": 1000.0,
        "48": 1200.0
    }

    # ASME Class to approximate working pressure in BAR (at ambient temperature per ASME B16.34)
    PRESSURE_CLASS_TO_BAR: Dict[str, float] = {
        "150#": 19.6,     # Class 150 ~ 20 bar
        "300#": 51.1,     # Class 300 ~ 50 bar
        "400#": 68.1,
        "600#": 102.1,    # Class 600 ~ 100 bar
        "800#": 136.0,    # Forged valves Class 800
        "900#": 153.2,    # Class 900 ~ 150 bar
        "1500#": 255.3,   # Class 1500 ~ 250 bar
        "2500#": 425.5,   # Class 2500 ~ 420 bar
        "4500#": 765.0
    }

    # DIN / ISO PN ratings to BAR (1 PN = 1 BAR)
    PN_TO_BAR: Dict[str, float] = {
        "PN6": 6.0,
        "PN10": 10.0,
        "PN16": 16.0,
        "PN25": 25.0,
        "PN40": 40.0,
        "PN64": 64.0,
        "PN100": 100.0,
        "PN160": 160.0,
        "PN250": 250.0,
        "PN400": 400.0
    }

    # Schedule standard thickness ordering (thinner -> thicker)
    SCHEDULE_RANKS: Dict[str, int] = {
        "SCH 5": 1,
        "SCH 10": 2,
        "SCH 10S": 2,
        "SCH 20": 3,
        "SCH 30": 4,
        "SCH 40": 5,
        "SCH 40S": 5,
        "SCH STD": 5,
        "STD": 5,
        "SCH 60": 6,
        "SCH 80": 7,
        "SCH 80S": 7,
        "SCH XS": 7,
        "XS": 7,
        "SCH 100": 8,
        "SCH 120": 9,
        "SCH 140": 10,
        "SCH 160": 11,
        "SCH XXS": 12,
        "XXS": 12
    }

    @classmethod
    def parse_dimension_to_mm(cls, dim_str: Optional[str]) -> Optional[float]:
        """
        Parses dimension string to nominal millimeters float value.
        Handles metric (DN50, 50MM, 50 NB), fractions (1/2", 1 1/2"), decimals (1.5 IN, 2 INCH).
        """
        if not dim_str:
            return None

        s = dim_str.strip().upper()

        # 1. Explicit metric DN or NB (e.g. DN50, DN 100, 50 NB, 100NB)
        dn_match = re.search(r'\b(?:DN\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:NB|DN))\b', s)
        if dn_match:
            val_str = dn_match.group(1) or dn_match.group(2)
            try:
                val = float(val_str)
                if val > 0:
                    return val
            except ValueError:
                pass

        # 2. Explicit MM (e.g. 50MM, 50.8 MM)
        mm_match = re.search(r'\b(\d+(?:\.\d+)?)\s*MM\b', s)
        if mm_match:
            try:
                val = float(mm_match.group(1))
                if val > 0:
                    return val
            except ValueError:
                pass

        # 3. Strip parentheses (e.g. "(DN50)" handled above)
        clean = re.sub(r'\(.*?\)', '', s).strip()
        clean = re.sub(r'["\']|INCH|IN', '', clean).strip()

        # Look up exact key in NPS map
        if clean in cls.NPS_TO_MM:
            return cls.NPS_TO_MM[clean]

        # Mixed fraction: e.g. "1 1/2" -> 1.5 inches -> ~40mm
        mixed_match = re.match(r'^(\d+)\s+(\d+)/(\d+)$', clean)
        if mixed_match:
            whole = float(mixed_match.group(1))
            num = float(mixed_match.group(2))
            den = float(mixed_match.group(3))
            if den > 0:
                inches = whole + (num / den)
                inch_key = f"{int(whole)} {int(num)}/{int(den)}"
                if inch_key in cls.NPS_TO_MM:
                    return cls.NPS_TO_MM[inch_key]
                return round(inches * 25.4, 1)

        # Simple fraction: e.g. "1/2" -> 0.5 inches
        frac_match = re.match(r'^(\d+)/(\d+)$', clean)
        if frac_match:
            num = float(frac_match.group(1))
            den = float(frac_match.group(2))
            if den > 0:
                key = f"{int(num)}/{int(den)}"
                if key in cls.NPS_TO_MM:
                    return cls.NPS_TO_MM[key]
                return round((num / den) * 25.4, 1)

        # Simple float/int inches: e.g. "2", "2.5"
        num_match = re.match(r'^(\d+(?:\.\d+)?)$', clean)
        if num_match:
            val_str = num_match.group(1)
            if val_str in cls.NPS_TO_MM:
                return cls.NPS_TO_MM[val_str]
            try:
                inches = float(val_str)
                if inches <= 48:
                    return round(inches * 25.4, 1)
                return inches
            except ValueError:
                pass

        return None

    @classmethod
    def are_dimensions_compatible(
        cls,
        dim1: Optional[str],
        dim2: Optional[str],
        tolerance_mm: float = 2.0
    ) -> Tuple[bool, float, Optional[str]]:
        """
        Determines if two dimension specifications are physically compatible.
        Returns: (is_compatible, mm_diff, explanation)
        """
        if not dim1 or not dim2:
            return True, 0.0, "One or both dimensions unspecified; tolerance neutral."

        mm1 = cls.parse_dimension_to_mm(dim1)
        mm2 = cls.parse_dimension_to_mm(dim2)

        if mm1 is None or mm2 is None:
            # Fallback to string equality
            d1_clean = re.sub(r'[\s"\']', '', dim1.upper())
            d2_clean = re.sub(r'[\s"\']', '', dim2.upper())
            return d1_clean == d2_clean, 0.0 if d1_clean == d2_clean else 999.0, "String comparison fallback"

        diff = abs(mm1 - mm2)
        if diff <= tolerance_mm:
            return True, diff, f"Dimensions match within physical tolerance ({mm1:.1f}mm vs {mm2:.1f}mm, diff {diff:.2f}mm <= {tolerance_mm}mm)"
        else:
            return False, diff, f"Dimensional incompatibility: {mm1:.1f}mm vs {mm2:.1f}mm exceeds {tolerance_mm}mm tolerance (diff {diff:.1f}mm)"

    @classmethod
    def parse_pressure_to_bar(cls, rating_str: Optional[str]) -> Optional[float]:
        """
        Parses pressure rating string (ASME Class or PN) into equivalent BAR.
        e.g. "150#" -> 19.6 bar, "600#" -> 102.1 bar, "PN40" -> 40.0 bar.
        """
        if not rating_str:
            return None

        s = rating_str.strip().upper()
        # Clean standard class
        clean_class = re.sub(r'(?:CLASS|CL|CLS)\s*', '', s)
        clean_class = re.sub(r'\s*LB[S]?', '#', clean_class)
        if not clean_class.endswith("#") and clean_class.isdigit():
            clean_class += "#"

        if clean_class in cls.PRESSURE_CLASS_TO_BAR:
            return cls.PRESSURE_CLASS_TO_BAR[clean_class]

        # PN check
        pn_match = re.search(r'PN\s*(\d+)', s)
        if pn_match:
            pn_val = pn_match.group(1)
            key = f"PN{pn_val}"
            if key in cls.PN_TO_BAR:
                return cls.PN_TO_BAR[key]
            try:
                return float(pn_val)
            except ValueError:
                pass

        # Bar check
        bar_match = re.search(r'(\d+(?:\.\d+)?)\s*BAR', s)
        if bar_match:
            try:
                return float(bar_match.group(1))
            except ValueError:
                pass

        # PSI check (1 bar = 14.5038 psi)
        psi_match = re.search(r'(\d+(?:\.\d+)?)\s*PSI', s)
        if psi_match:
            try:
                return round(float(psi_match.group(1)) / 14.5038, 1)
            except ValueError:
                pass

        return None

    @classmethod
    def are_pressure_ratings_compatible(
        cls,
        rating1: Optional[str],
        rating2: Optional[str],
        bar_ratio_tolerance: float = 0.15
    ) -> Tuple[bool, Optional[str]]:
        """
        Verifies if two pressure ratings are safe to interchange.
        In piping/valves, higher class is NOT interchangeable with lower class without committee review.
        Exact or near PN/ASME equivalents (e.g. PN20 and 150#) are compatible.
        """
        if not rating1 or not rating2:
            return True, "Pressure rating neutral (unspecified on one side)"

        bar1 = cls.parse_pressure_to_bar(rating1)
        bar2 = cls.parse_pressure_to_bar(rating2)

        if bar1 is None or bar2 is None:
            r1 = rating1.strip().upper()
            r2 = rating2.strip().upper()
            return r1 == r2, f"Exact string comparison: '{r1}' vs '{r2}'"

        # Check ratio
        ratio = bar1 / bar2 if bar2 > 0 else 999.0
        if (1.0 - bar_ratio_tolerance) <= ratio <= (1.0 + bar_ratio_tolerance):
            return True, f"Pressure ratings aligned ({bar1:.1f} bar vs {bar2:.1f} bar)"

        return False, f"Critical pressure rating mismatch: {rating1} ({bar1:.1f} bar) vs {rating2} ({bar2:.1f} bar) — severe rupture/containment risk!"

    @classmethod
    def are_schedules_compatible(cls, sch1: Optional[str], sch2: Optional[str]) -> Tuple[bool, Optional[str]]:
        """
        Verifies pipe wall thickness / schedule compatibility.
        e.g. SCH 40 vs SCH 80 are physically incompatible (different ID & burst pressure).
        """
        if not sch1 or not sch2:
            return True, "Schedule neutral (unspecified on one side)"

        s1 = sch1.strip().upper()
        s2 = sch2.strip().upper()

        rank1 = cls.SCHEDULE_RANKS.get(s1)
        rank2 = cls.SCHEDULE_RANKS.get(s2)

        if rank1 is not None and rank2 is not None:
            if rank1 == rank2:
                return True, f"Wall thickness schedules match ({s1} == {s2})"
            return False, f"Wall thickness schedule mismatch: {s1} vs {s2} (different internal diameter & burst pressure)"

        return s1 == s2, f"Schedule match: {s1} vs {s2}"

    @classmethod
    def are_flange_facings_compatible(cls, facing1: Optional[str], facing2: Optional[str]) -> Tuple[bool, Optional[str]]:
        """
        Verifies flange facing compatibility.
        RF (Raised Face), FF (Flat Face), RTJ (Ring Type Joint) are physically incompatible without machining.
        """
        if not facing1 or not facing2:
            return True, "Flange facing neutral"

        f1 = facing1.strip().upper()
        f2 = facing2.strip().upper()

        if f1 == f2:
            return True, f"Flange facings match ({f1})"

        incompatible_pairs = {
            ("RF", "FF"), ("FF", "RF"),
            ("RF", "RTJ"), ("RTJ", "RF"),
            ("FF", "RTJ"), ("RTJ", "FF")
        }

        if (f1, f2) in incompatible_pairs:
            return False, f"Flange facing contradiction: {f1} cannot seal against {f2} (gasket seating failure hazard)"

        return f1 == f2, f"Flange facing comparison: {f1} vs {f2}"
