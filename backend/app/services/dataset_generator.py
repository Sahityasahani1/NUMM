import random
import csv
import io
import os
from typing import List, Dict, Any

class IndustrialMROBenchmarkGenerator:
    CPSE_LIST = ["ONGC", "IOCL", "GAIL", "BPCL", "HPCL"]

    NOUN_CATEGORIES = [
        {
            "noun": "BALL VALVE",
            "modifiers": ["2-PIECE", "3-PIECE", "FLOATING", "TRUNNION MOUNTED", "FULL BORE", "REDUCED BORE"],
            "sizes": ['1/2"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"'],
            "ratings": ["150#", "300#", "600#", "900#", "1500#"],
            "materials": ["ASTM A216 WCB", "ASTM A105", "SS 316", "SS 304", "ASTM A350 LF2", "DUPLEX 2205"],
            "standards": ["API 6D", "ASME B16.34", "BS 5351", "API 608"],
            "uoms": ["NOS", "EA", "SET", "NUMBER"]
        },
        {
            "noun": "GATE VALVE",
            "modifiers": ["RISING STEM", "NON RISING STEM", "BOLTED BONNET", "WEDGE TYPE", "FLEXIBLE WEDGE"],
            "sizes": ['2"', '3"', '4"', '6"', '8"', '10"', '12"'],
            "ratings": ["150#", "300#", "600#", "900#", "1500#"],
            "materials": ["ASTM A216 WCB", "ASTM A217 WC6", "ASTM A350 LF2", "SS 316L"],
            "standards": ["API 600", "API 602", "ASME B16.34", "BS 1414"],
            "uoms": ["NOS", "EA", "PC"]
        },
        {
            "noun": "WELD NECK FLANGE",
            "modifiers": ["RAISED FACE", "FLAT FACE", "RING TYPE JOINT"],
            "sizes": ['1/2"', '1"', '2"', '3"', '4"', '6"', '8"', '10"', '12"'],
            "ratings": ["150#", "300#", "600#", "900#", "1500#"],
            "materials": ["ASTM A105", "ASTM A350 LF2", "ASTM A182 F316L", "ASTM A182 F304L"],
            "standards": ["ASME B16.5", "ASME B16.47", "DIN 2633"],
            "uoms": ["NOS", "EA", "NUMBER"]
        },
        {
            "noun": "BLIND FLANGE",
            "modifiers": ["RAISED FACE", "RTJ FACING", "SMOOTH FINISH"],
            "sizes": ['1"', '2"', '3"', '4"', '6"', '8"', '10"'],
            "ratings": ["150#", "300#", "600#"],
            "materials": ["ASTM A105", "ASTM A182 F316L", "ASTM A350 LF2"],
            "standards": ["ASME B16.5"],
            "uoms": ["NOS", "EA"]
        },
        {
            "noun": "SEAMLESS PIPE",
            "modifiers": ["BEVELED ENDS", "PLAIN ENDS", "THREADED", "SCH 40", "SCH 80", "SCH 160"],
            "sizes": ['1"', '2"', '3"', '4"', '6"', '8"', '10"', '12"'],
            "ratings": ["SCH 40", "SCH 80", "SCH 160", "SCH STD", "SCH XS"],
            "materials": ["ASTM A106 GRADE B", "ASTM A333 GRADE 6", "ASTM A312 TP316L", "API 5L GRADE B"],
            "standards": ["ASME B36.10M", "API 5L", "ASTM A53"],
            "uoms": ["MTR", "M", "METER", "LENGTH"]
        },
        {
            "noun": "SPIRAL WOUND GASKET",
            "modifiers": ["WITH INNER & OUTER RING", "WITH CENTERING RING", "GRAPHITE FILLER", "PTFE FILLER"],
            "sizes": ['1/2"', '1"', '2"', '3"', '4"', '6"', '8"', '10"', '12"'],
            "ratings": ["150#", "300#", "600#", "900#"],
            "materials": ["SS 316L WINDINGS WITH CS OUTER RING", "SS 304 WINDINGS", "MONEL 400"],
            "standards": ["ASME B16.20"],
            "uoms": ["NOS", "EA", "PCS"]
        },
        {
            "noun": "STUD BOLT",
            "modifiers": ["WITH 2 HEAVY HEX NUTS", "FULLY THREADED", "ZINC PLATED", "CADMIUM PLATED"],
            "sizes": ['1/2" X 2.5"', '5/8" X 3.5"', '3/4" X 4.5"', '7/8" X 5.5"', '1" X 6.5"'],
            "ratings": ["CLASS 2A/2B"],
            "materials": ["ASTM A193 GRADE B7 WITH A194 2H", "ASTM A193 B8M WITH A194 8M", "ASTM A320 L7"],
            "standards": ["ASME B18.2.1", "ASME B18.2.2"],
            "uoms": ["SET", "NOS", "EA"]
        },
        {
            "noun": "CENTRIFUGAL PUMP",
            "modifiers": ["SINGLE STAGE END SUCTION", "HORIZONTAL SPLIT CASE", "MULTI STAGE"],
            "sizes": ["DN 50 X DN 32", "DN 80 X DN 50", "DN 100 X DN 80", "DN 150 X DN 100"],
            "ratings": ["16 BAR", "25 BAR", "40 BAR"],
            "materials": ["CAST IRON CI", "DUCTILE IRON DI", "STAINLESS STEEL 316", "BRONZE"],
            "standards": ["API 610", "ISO 5199", "ISO 2858"],
            "uoms": ["EA", "SET", "NOS"]
        }
    ]

    ABBREVIATION_NOISE = {
        "VALVE": ["VLV", "VALV", "VALVE"],
        "FLANGE": ["FLG", "FLNG", "FLANGE"],
        "PIPE": ["PIP", "PIPE"],
        "SEAMLESS": ["SMLS", "SMLS.", "SEAMLESS"],
        "GASKET": ["GSKT", "GSK", "GASKET"],
        "SPIRAL WOUND": ["SPWD", "SP WOUND", "SPIRAL WOUND"],
        "STAINLESS STEEL": ["SS", "S.S.", "SST", "STAINLESS STEEL"],
        "CARBON STEEL": ["CS", "C.S.", "CARBON STEEL"],
        "150#": ["150#", "150 LB", "150LBS", "CLASS 150", "CL 150"],
        "300#": ["300#", "300 LB", "300LBS", "CLASS 300", "CL 300"],
        "600#": ["600#", "600 LB", "600LBS", "CLASS 600", "CL 600"],
        "2\"": ['2"', '2 INCH', '2IN', '2 IN', 'DN50'],
        '3"': ['3"', '3 INCH', '3IN', '3 IN', 'DN80'],
        '4"': ['4"', '4 INCH', '4IN', '4 IN', 'DN100'],
        '6"': ['6"', '6 INCH', '6IN', '6 IN', 'DN150']
    }

    @classmethod
    def generate_benchmark_records(cls, count: int = 738, cluster_count: int = 145) -> List[Dict[str, Any]]:
        random.seed(26099)
        records: List[Dict[str, Any]] = []

        # Maintain common core concepts so cross-CPSE equivalence clusters emerge naturally
        clusters = []
        for _ in range(cluster_count):
            cat = random.choice(cls.NOUN_CATEGORIES)
            cluster_concept = {
                "noun": cat["noun"],
                "modifier": random.choice(cat["modifiers"]),
                "size": random.choice(cat["sizes"]),
                "rating": random.choice(cat["ratings"]),
                "material": random.choice(cat["materials"]),
                "standard": random.choice(cat["standards"]),
                "base_uom": random.choice(cat["uoms"])
            }
            clusters.append(cluster_concept)

        for i in range(count):
            cluster = random.choice(clusters)
            cpse = cls.CPSE_LIST[i % len(cls.CPSE_LIST)]
            code_num = 1000 + i

            # Noise injection (abbreviations, casing, punctuation)
            noun_str = cluster["noun"]
            for key, options in cls.ABBREVIATION_NOISE.items():
                if key == noun_str and random.random() < 0.6:
                    noun_str = random.choice(options)
                    break

            size_str = cluster["size"]
            if size_str in cls.ABBREVIATION_NOISE and random.random() < 0.6:
                size_str = random.choice(cls.ABBREVIATION_NOISE[size_str])

            rating_str = cluster["rating"]
            if rating_str in cls.ABBREVIATION_NOISE and random.random() < 0.6:
                rating_str = random.choice(cls.ABBREVIATION_NOISE[rating_str])

            mat_str = cluster["material"]
            for key, options in cls.ABBREVIATION_NOISE.items():
                if key in mat_str and random.random() < 0.5:
                    mat_str = mat_str.replace(key, random.choice(options))

            # Compose description variations
            patterns = [
                f"{noun_str} {size_str} {rating_str} {mat_str} {cluster['modifier']}",
                f"{cluster['modifier']} {noun_str}, {size_str}, {rating_str}, {mat_str}",
                f"{noun_str} {cluster['modifier']} {size_str} RATING {rating_str} {mat_str}",
                f"{size_str} {noun_str} {mat_str} {rating_str} {cluster['standard']}"
            ]
            desc = random.choice(patterns)

            # Inconsistent UOM
            uom = cluster["base_uom"]
            if uom in ["NOS", "EA", "PC"] and random.random() < 0.4:
                uom = random.choice(["NOS", "EA", "PC", "NUMBER", "EACH"])
            elif uom in ["MTR", "M"] and random.random() < 0.4:
                uom = random.choice(["MTR", "M", "METER", "LENGTH"])

            record = {
                "source_material_code": f"{cpse}-{code_num}",
                "description": desc.upper(),
                "uom": uom,
                "specifications": f"{cluster['standard']} SPEC COMPLIANT, TESTING AS PER RELEVANT STANDARD",
                "source_system": f"SAP_{cpse}",
                "cpse_id": cpse
            }
            records.append(record)

        return records

    @classmethod
    def write_csv(cls, records: List[Dict[str, Any]], filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        keys = ["source_material_code", "description", "uom", "specifications", "source_system"]
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            for r in records:
                row_dict = {k: r[k] for k in keys}
                writer.writerow(row_dict)
