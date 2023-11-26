import cv2
import dlib
from scipy.spatial import distance
import time
import requests


def setup_camera(camera_index):
    return cv2.VideoCapture(camera_index)


def detect_faces(gray_image, detector):
    return detector(gray_image)


def draw_lines(frame, landmarks, start, end, color):
    for n in range(start, end):
        x = landmarks.part(n).x
        y = landmarks.part(n).y
        next_point = n + 1
        if n == end - 1:
            next_point = start
        x2 = landmarks.part(next_point).x
        y2 = landmarks.part(next_point).y
        cv2.line(frame, (x, y), (x2, y2), color, 1)


def calculate_aspect_ratio(eye):
    poi_A = distance.euclidean(eye[1], eye[5])
    poi_B = distance.euclidean(eye[2], eye[4])
    poi_C = distance.euclidean(eye[0], eye[3])
    aspect_ratio_eye = (poi_A + poi_B) / (2 * poi_C)
    return aspect_ratio_eye


def display_alert(frame, text, position, font_scale, color, thickness):
    cv2.putText(frame, text, position, cv2.FONT_HERSHEY_PLAIN, font_scale, color, thickness)


def process_eyes(frame, face_landmarks):
    left_eye = []
    right_eye = []

    draw_lines(frame, face_landmarks, 42, 48, (0, 255, 0))  # Left eye
    draw_lines(frame, face_landmarks, 36, 42, (255, 255, 0))  # Right eye

    for n in range(42, 48):
        x = face_landmarks.part(n).x
        y = face_landmarks.part(n).y
        right_eye.append((x, y))

    for n in range(36, 42):
        x = face_landmarks.part(n).x
        y = face_landmarks.part(n).y
        left_eye.append((x, y))

    return left_eye, right_eye


def main():
    cap = setup_camera(0)
    face_detector = dlib.get_frontal_face_detector()
    dlib_facelandmark = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
    start = time.time()
    drowsy_count = 0
    awake_count = 0
    cycle = 0
    name = "Drowsy Cam"

    while cycle < 5:
        _, frame = cap.read()
        gray_scale = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = detect_faces(gray_scale, face_detector)

        for face in faces:
            face_landmarks = dlib_facelandmark(gray_scale, face)
            left_eye, right_eye = process_eyes(frame, face_landmarks)

            right_eye_ratio = calculate_aspect_ratio(right_eye)
            left_eye_ratio = calculate_aspect_ratio(left_eye)
            eye_ratio = (left_eye_ratio + right_eye_ratio) / 2
            eye_ratio = round(eye_ratio, 2)

            if eye_ratio < 0.25:
                drowsy_count += 1
                cv2.putText(frame, "GO TO WORK", (50, 450), cv2.FONT_HERSHEY_PLAIN, 2, (51, 51, 255), 3)
                cv2.putText(frame, "Good-for-nothing DETECTED", (50, 100), cv2.FONT_HERSHEY_PLAIN, 2, (51, 51, 255), 3)
            else:
                awake_count += 1

        end = time.time()
        if end - start >= 2:
            if drowsy_count * 0.2 > awake_count:
                print("You are drowsy")
                requests.post("http://127.0.0.1:3001/drowsy")
            else:
                print("You are awake")
            drowsy_count = 0
            awake_count = 0
            cycle += 1
            start = end

        cv2.namedWindow(name)
        cv2.moveWindow(name, 1500, 700)
        cv2.imshow(name, frame)
        key = cv2.waitKey(9)
        if key == 20:
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
