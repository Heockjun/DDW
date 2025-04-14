import sys
import shutil

def embed_watermark(input_path, output_path):
    # 진짜 워터마크 로직 대신 복사로 대체 (테스트용)
    shutil.copy(input_path, output_path)
    print("워터마킹 완료")

if __name__ == '__main__':
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    embed_watermark(input_path, output_path)
