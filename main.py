from anonymizer import anonymize_data

if __name__ == "__main__":
    # --- 단일 레코드 예시 ---
    single_record_data = {
        "id": "user_001",
        "name": "홍길동",
        "email": "hong.gildong@example.com",
        "account_number": "1234-5678-9012",
        "balance": 1000000
    }

    print("--- 단일 레코드 익명화 전 ---")
    print(single_record_data)
    
    anonymized_single_record = anonymize_data(single_record_data)
    print("\n--- 단일 레코드 익명화 후 ---")
    print(anonymized_single_record)

    print("-" * 50)

    # --- 다중 레코드 예시 ---
    multiple_records_data = [
        {
            "id": "user_001",
            "name": "홍길동",
            "email": "hong.gildong@example.com",
            "account_number": "1234-5678-9012",
            "balance": 1000000
        },
        {
            "id": "user_002",
            "name": "김철수",
            "email": "kim.chulsoo@example.com",
            "account_number": "9876-5432-1098",
            "balance": 500000
        },
        {
            "id": "user_003",
            "email": "lee.younghee@example.com", # 이름 필드 없음
            "account_number": "1111-2222-3333",
            "balance": 750000
        },
        {
            "id": "user_004",
            "name": "박영희",
            "email": "park.younghee@example.com",
            "balance": 200000 # 계좌번호 필드 없음
        },
        {
            "id": "user_005",
            "name": 12345, # 이름 필드가 문자열이 아님 (익명화 건너뜀)
            "email": "invalid.name@example.com",
            "account_number": "1234-5678-9012",
            "balance": 100000
        },
        {
            "id": "user_006",
            "name": "유효한 이름",
            "email": "invalid.account@example.com",
            "account_number": 987654321098, # 계좌번호 필드가 문자열이 아님 (익명화 건너뜀)
            "balance": 200000
        },
        "이것은 딕셔너리가 아닙니다.", # 리스트 내 딕셔너리가 아닌 요소 (변경 없이 반환)
        None # 리스트 내 None 요소 (변경 없이 반환)
    ]

    print("--- 다중 레코드 익명화 전 ---")
    for record in multiple_records_data:
        print(record)
    
    anonymized_multiple_records = anonymize_data(multiple_records_data)
    print("\n--- 다중 레코드 익명화 후 ---")
    for record in anonymized_multiple_records:
        print(record)

    print("-" * 50)

    # --- 잘못된 입력 타입 예시 ---
    try:
        print("\n--- 잘못된 입력 타입 처리 예시 (문자열) ---")
        anonymize_data("이것은 문자열입니다.")
    except TypeError as e:
        print(f"에러 발생: {e}")

    try:
        print("\n--- 잘못된 입력 타입 처리 예시 (정수) ---")
        anonymize_data(12345)
    except TypeError as e:
        print(f"에러 발생: {e}")

    try:
        print("\n--- 잘못된 입력 타입 처리 예시 (None) ---")
        anonymize_data(None)
    except TypeError as e:
        print(f"에러 발생: {e}")