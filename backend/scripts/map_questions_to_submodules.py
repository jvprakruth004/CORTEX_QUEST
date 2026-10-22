#!/usr/bin/env python3
"""
Map existing questions to submodules based on content analysis.
Run with: DATABASE_URL=postgresql://.../cortex_quest_test python map_questions_to_submodules.py --apply
"""
import os
import sys
import argparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.models.content import Question, Submodule, Module


# Mapping of question IDs to submodule IDs
# Based on content analysis of each question
QUESTION_SUBMODULE_MAP = {
    # apt (module_id=1) - 13 questions
    # Submodules: 1=Arithmetic, 2=Quantitative Aptitude, 3=Time and Work
    1560: 1,   # 25% of 200 -> Arithmetic
    1561: 3,   # train speed -> Time and Work
    1562: 1,   # 5 pens cost -> Arithmetic
    2706: 1,   # rectangle perimeter -> Arithmetic
    2714: 1,   # average -> Arithmetic
    2722: 1,   # simple interest -> Arithmetic
    2723: 1,   # ratio -> Arithmetic
    2724: 2,   # profit percentage -> Quantitative Aptitude
    2725: 3,   # worker A & B -> Time and Work
    2754: 1,   # triangle area -> Arithmetic
    2755: 1,   # discount -> Arithmetic
    2756: 3,   # two cars -> Time and Work
    2757: 1,   # father age -> Arithmetic

    # di (module_id=2) - 13 questions
    # Submodules: 4=Tables and Charts, 5=Graph Analysis, 6=Caselet Analysis
    1563: 4,   # bar chart sales -> Tables and Charts
    1564: 5,   # pie chart sector -> Graph Analysis
    1565: 5,   # line graph temperature -> Graph Analysis
    2707: 4,   # table fruit -> Tables and Charts
    2715: 4,   # table clubs -> Tables and Charts
    2726: 5,   # bar chart attendance -> Graph Analysis
    2727: 4,   # table vehicles -> Tables and Charts
    2728: 5,   # pie chart budget -> Graph Analysis
    2729: 4,   # table revenue -> Tables and Charts
    2758: 4,   # table egg production -> Tables and Charts
    2759: 4,   # chart exam sections -> Tables and Charts
    2760: 4,   # sales table -> Tables and Charts
    2761: 5,   # pie chart demographics -> Graph Analysis

    # lr (module_id=3) - 13 questions
    # Submodules: 7=Verbal Reasoning, 8=Analytical Reasoning, 9=Non-Verbal Reasoning
    1566: 7,   # number pattern -> Verbal Reasoning
    1567: 8,   # roses/flowers logic -> Analytical Reasoning
    1568: 7,   # odd one out numbers -> Verbal Reasoning
    2708: 8,   # A>B>B>C -> Analytical Reasoning
    2716: 7,   # letter series -> Verbal Reasoning
    2730: 7,   # Book:Reading :: Fork: -> Verbal Reasoning
    2731: 8,   # direction walking -> Analytical Reasoning
    2732: 7,   # number series -> Verbal Reasoning
    2733: 8,   # family relation -> Analytical Reasoning
    2762: 7,   # letter coding -> Verbal Reasoning
    2763: 9,   # geometric shapes -> Non-Verbal Reasoning
    2764: 8,   # seating arrangement -> Analytical Reasoning
    2765: 7,   # number sequence -> Verbal Reasoning

    # gk (module_id=4) - 13 questions
    # Submodules: 10=Science and Technology, 11=History and Geography, 12=Current Affairs
    1569: 11,  # capital Australia -> History and Geography
    1570: 10,  # Red Planet -> Science and Technology
    1571: 11,  # continents -> History and Geography
    2709: 11,  # largest ocean -> History and Geography
    2717: 11,  # tallest mountain -> History and Geography
    2734: 11,  # longest river -> History and Geography
    2735: 10,  # chemical symbol O -> Science and Technology
    2736: 10,  # WWW inventor -> Science and Technology
    2737: 11,  # largest country -> History and Geography
    2766: 10,  # closest planet -> Science and Technology
    2767: 11,  # currency Japan -> History and Geography
    2768: 10,  # speed of light -> Science and Technology
    2769: 11,  # largest hot desert -> History and Geography

    # prog (module_id=5) - 12 questions
    # Submodules: 13=Programming Fundamentals, 14=Control Statements and Loops, 15=Arrays and Data Structures
    1572: 13,  # HTML -> Programming Fundamentals
    1573: 13,  # Python def -> Programming Fundamentals
    1574: 13,  # 2**3 -> Programming Fundamentals
    2710: 13,  # len('hello') -> Programming Fundamentals
    2718: 13,  # Python comment # -> Programming Fundamentals
    2738: 13,  # my_list[0] -> Programming Fundamentals
    2739: 13,  # True and False -> Programming Fundamentals
    2740: 14,  # sum(range) -> Control Statements and Loops
    2741: 15,  # PYTHON[-1] -> Arrays and Data Structures (string indexing)
    2770: 13,  # 'Data'+'base' -> Programming Fundamentals
    2771: 13,  # 17%5 -> Programming Fundamentals
    2772: 15,  # list append -> Arrays and Data Structures

    # cs (module_id=6) - 12 questions
    # Submodules: 16=Operating Systems, 17=Database Management Systems, 18=Computer Networks
    1575: 16,  # CPU -> Operating Systems
    1576: 16,  # volatile memory -> Operating Systems
    1577: 16,  # binary 10 -> Operating Systems
    2711: 16,  # RAM -> Operating Systems
    2719: 16,  # bits in byte -> Operating Systems
    2742: 16,  # open-source kernel -> Operating Systems
    2743: 16,  # MB in GB -> Operating Systems
    2744: 18,  # HTTPS -> Computer Networks
    2745: 15,  # Queue FIFO -> Arrays and Data Structures (but CS module, so map to closest)
    2773: 16,  # input device -> Operating Systems
    2774: 17,  # SQL WHERE -> Database Management Systems
    2775: 18,  # IPv4 bits -> Computer Networks

    # eng (module_id=7) - 12 questions
    # Submodules: 19=Electrical Fundamentals, 20=Mechanical Fundamentals, 21=Engineering Mathematics
    1578: 19,  # SI unit force -> Electrical Fundamentals (physics)
    1579: 20,  # energy conservation -> Mechanical Fundamentals (thermodynamics)
    1580: 19,  # unit resistance -> Electrical Fundamentals
    2712: 19,  # SI unit power -> Electrical Fundamentals
    2720: 19,  # SI unit current -> Electrical Fundamentals
    2746: 19,  # Ohm's Law -> Electrical Fundamentals
    2747: 19,  # SI unit frequency -> Electrical Fundamentals
    2748: 20,  # SI unit pressure -> Mechanical Fundamentals
    2749: 20,  # heat transfer radiation -> Mechanical Fundamentals
    2776: 19,  # SI unit work/energy -> Electrical Fundamentals
    2777: 20,  # Hooke's Law -> Mechanical Fundamentals
    2778: 19,  # SI unit capacitance -> Electrical Fundamentals

    # med (module_id=8) - 12 questions
    # Submodules: 22=Human Anatomy, 23=Human Physiology, 24=Basic Medical Science
    1581: 22,  # heart chambers -> Human Anatomy
    1582: 24,  # universal donor -> Basic Medical Science
    1583: 23,  # body temperature -> Human Physiology
    2713: 22,  # kidney filter blood -> Human Anatomy
    2721: 23,  # RBC transport oxygen -> Human Physiology
    2750: 22,  # bones in skeleton -> Human Anatomy
    2751: 23,  # alveoli gas exchange -> Human Physiology
    2752: 24,  # pancreas insulin -> Basic Medical Science
    2753: 22,  # aorta -> Human Anatomy
    2779: 22,  # largest organ skin -> Human Anatomy
    2780: 23,  # hemoglobin -> Human Physiology
    2781: 24,  # bone marrow -> Basic Medical Science

    # Note: Q437 is a test question (What is 20% of 150?) - map to Arithmetic
    437: 1,
}


def map_questions(db_url: str, apply: bool = False) -> int:
    engine = create_engine(db_url, poolclass=None)
    SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
    db = SessionLocal()

    try:
        # Verify submodules exist
        submodules = {s.id: s for s in db.query(Submodule).filter(Submodule.is_active == 1).all()}
        if not submodules:
            print("ERROR: No submodules found in database")
            return 1

        print(f"Found {len(submodules)} active submodules")

        # Get questions to update
        questions = db.query(Question).filter(Question.is_active == 1).all()
        print(f"Found {len(questions)} active questions")

        mapped = 0
        skipped = 0
        errors = []

        for q in questions:
            if q.id in QUESTION_SUBMODULE_MAP:
                submodule_id = QUESTION_SUBMODULE_MAP[q.id]
                if submodule_id in submodules:
                    if apply:
                        q.submodule_id = submodule_id
                    mapped += 1
                    print(f"  Q{q.id} -> {submodules[submodule_id].slug}")
                else:
                    errors.append(f"Q{q.id}: submodule_id {submodule_id} not found")
            else:
                skipped += 1
                print(f"  Q{q.id}: NO MAPPING (skipped)")

        if errors:
            print("\nERRORS:")
            for e in errors:
                print(f"  - {e}")
            return 1

        print(f"\nSummary: {mapped} mapped, {skipped} skipped (no mapping)")

        if apply and mapped > 0:
            db.commit()
            print("Changes committed to database.")
        elif not apply:
            print("DRY RUN - use --apply to commit changes")

        return 0

    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        return 1
    finally:
        db.close()
        engine.dispose()


def main():
    parser = argparse.ArgumentParser(description="Map questions to submodules")
    parser.add_argument('--apply', action='store_true', help='Apply changes to database')
    parser.add_argument('--dry-run', action='store_true', help='Explicit dry run')
    args = parser.parse_args()

    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("ERROR: DATABASE_URL environment variable required")
        return 1

    apply = args.apply and not args.dry_run
    return map_questions(db_url, apply)


if __name__ == '__main__':
    sys.exit(main())