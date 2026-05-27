import random
import string
from typing import Dict, List, Union

def _generate_random_name() -> str:
    """
    무작위 익명 사용자 이름을 생성합니다.
    예: "익명 사용자_ABCD"
    """
    random_suffix = ''.join(random.choices(string.ascii_uppercase, k=4))
    return f"익명 사용자_{random_suffix}"

def _generate_random_account_number(original_length: int) -> str:
    """
    주어진 길이에 맞춰 무작위 숫자 문자열(계좌번호)을 생성합니다.
    원본 계좌번호의 숫자 부분 길이가 0인 경우, 기본 길이 12를 사용합니다.
    """
    numeric_length = original_length
    if original_length == 0:
        numeric_length = 12 # 기본 길이 설정 (예: 12자리)
    
    return ''.join(random.choices(string.digits, k=numeric_length))

def _anonymize_single_record(record: Dict) -> Dict:
    """
    단일 레코드(딕셔너리)의 'name'과 'account_number' 필드를 익명화합니다.
    """
    anonymized_record = record.copy() # 원본 데이터 변경 방지를 위해 복사

    if 'name' in anonymized_record and isinstance(anonymized_record['name'], str):
        anonymized_record['name'] = _generate_random_name()

    if 'account_number' in anonymized_record and isinstance(anonymized_record['account_number'], str):
        # 원본 계좌번호에서 숫자만 추출하여 길이 계산
        original_numeric_account_number = ''.join(filter(str.isdigit, anonymized_record['account_number']))
        original_length = len(original_numeric_account_number)
        
        anonymized_record['account_number'] = _generate_random_account_number(original_length)
        
    return anonymized_record

def anonymize_data(data: Union[Dict, List[Dict]]) -> Union[Dict, List[Dict]]:
    """
    입력된 데이터(단일 딕셔너리 또는 딕셔너리 리스트)에서 
    'name'과 'account_number' 필드를 익명화합니다.

    Args:
        data: 익명화할 데이터 (단일 딕셔너리 또는 딕셔너리 리스트).

    Returns:
        'name'과 'account_number' 필드가 익명화된 데이터.

    Raises:
        TypeError: 입력 데이터가 딕셔너리 또는 딕셔너리 리스트 형태가 아닌 경우.
    """
    if isinstance(data, dict):
        return _anonymize_single_record(data)
    elif isinstance(data, list):
        # 리스트 내의 각 요소가 딕셔너리인지 확인 (선택적, 현재는 _anonymize_single_record에서 처리)
        # _anonymize_single_record 함수는 딕셔너리가 아닌 요소를 받으면 해당 요소를 변경 없이 반환합니다.
        return [_anonymize_single_record(record) for record in data]
    else:
        raise TypeError("입력 데이터는 딕셔너리 또는 딕셔너리 리스트여야 합니다.")