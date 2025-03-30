import tkinter as tk
import random
import time
import hashlib
from PIL import Image, ImageGrab, EpsImagePlugin
# Si usas Windows, quizá necesites especificar la ruta de GhostScript:
# EpsImagePlugin.gs_windows_binary = r"C:\Program Files\gs\gs9.55.0\bin\gswin64c.exe"

# ----------------- Parámetros de dibujo -----------------
SEGMENT_LENGTH = 120
GAP_LENGTH = 40
LINE_WIDTH = 20
LEFT_MARGIN = 30
TOP_MARGIN = 40
LINE_SPACING = 50

# ----------------- Colores -----------------
NORMAL_COLOR = "white"
MUTANT_COLOR = "red"

# ----------------- Diccionario King Wen -----------------
# Cada clave es un string de 6 bits formado de abajo hacia arriba:
# lineas[0] es la línea inferior y lineas[5] la superior.
KING_WEN_MAPPING = {
    "111111": 1,   # 乾 (Qian)
    "000000": 2,   # 坤 (Kun)
    "100010": 3,   # 屯 (Zhun)
    "010001": 4,   # 蒙 (Meng)
    "111010": 5,   # 需 (Xu)
    "010111": 6,   # 訟 (Song)
    "010000": 7,   # 師 (Shi)
    "000010": 8,   # 比 (Bi)
    "111011": 9,   # 小畜 (Xiao Xu)
    "110111": 10,  # 履 (Lu)
    "111000": 11,  # 泰 (Tai)
    "000111": 12,  # 否 (Pi)
    "101111": 13,  # 同人 (Tong Ren)
    "111101": 14,  # 大有 (Da You)
    "001000": 15,  # 謙 (Qian)
    "000100": 16,  # 豫 (Yu)
    "100110": 17,  # 隨 (Sui)
    "011001": 18,  # 蠱 (Gu)
    "110000": 19,  # 臨 (Lin)
    "000011": 20,  # 觀 (Guan)
    "100101": 21,  # 噬嗑 (Shi He)
    "101001": 22,  # 賁 (Bi)
    "000001": 23,  # 剝 (Bo)
    "100000": 24,  # 復 (Fu)
    "100111": 25,  # 無妄 (Wu Wang)
    "111001": 26,  # 大畜 (Da Xu)
    "100001": 27,  # 頤 (Yi)
    "011110": 28,  # 大過 (Da Guo)
    "010010": 29,  # 坎 (Kan)
    "101101": 30,  # 離 (Li)
    "001110": 31,  # 咸 (Xian)
    "011100": 32,  # 恆 (Heng)
    "001111": 33,  # 遯 (Dun)
    "111100": 34,  # 大壯 (Da Zhuang)
    "000101": 35,  # 晉 (Jin)
    "101000": 36,  # 明夷 (Ming Yi)
    "101011": 37,  # 家人 (Jia Ren)
    "110101": 38,  # 睽 (Kui)
    "001010": 39,  # 蹇 (Jian)
    "010100": 40,  # 解 (Xie)
    "110001": 41,  # 損 (Sun)
    "100011": 42,  # 益 (Yi)
    "111110": 43,  # 夬 (Guai)
    "011111": 44,  # 姤 (Gou)
    "000110": 45,  # 萃 (Cui)
    "011000": 46,  # 升 (Sheng)
    "010110": 47,  # 困 (Kun)
    "011010": 48,  # 井 (Jing)
    "101110": 49,  # 革 (Ge)
    "011101": 50,  # 鼎 (Ding)
    "100100": 51,  # 震 (Zhen)
    "001001": 52,  # 艮 (Gen)
    "001011": 53,  # 漸 (Jian)
    "110100": 54,  # 歸妹 (Gui Mei)
    "101100": 55,  # 豐 (Feng)
    "001101": 56,  # 旅 (Lv)
    "011011": 57,  # 巽 (Xun)
    "110110": 58,  # 兌 (Dui)
    "010011": 59,  # 渙 (Huan)
    "110010": 60,  # 節 (Jie)
    "110011": 61,  # 中孚 (Zhong Fu)
    "001100": 62,  # 小過 (Xiao Guo)
    "101010": 63,  # 既濟 (Ji Ji)
    "010101": 64,  # 未濟 (Wei Ji)
}

# ----------------- Diccionario de nombres en orden King Wen -----------------
HEXAGRAMAS = {
    1: "乾 - El Cielo",
    2: "坤 - La Tierra",
    3: "屯 - La Dificultad Inicial",
    4: "蒙 - La Necedad Juvenil",
    5: "需 - La Espera",
    6: "訟 - El Conflicto",
    7: "師 - El Ejército",
    8: "比 - La Solidaridad",
    9: "小畜 - La Pequeña Acumulación",
    10: "履 - El Paso Cauteloso",
    11: "泰 - La Paz",
    12: "否 - El Estancamiento",
    13: "同人 - La Comunidad con los Hombres",
    14: "大有 - La Gran Posesión",
    15: "謙 - La Modestia",
    16: "豫 - El Entusiasmo",
    17: "隨 - El Seguimiento",
    18: "蠱 - La Corrupción",
    19: "臨 - El Acercamiento",
    20: "觀 - La Contemplación",
    21: "噬嗑 - La Mordedura Tajante",
    22: "賁 - La Gracia",
    23: "剝 - El Desmoronamiento",
    24: "復 - El Retorno",
    25: "無妄 - La Inocencia",
    26: "大畜 - El Gran Acumulador",
    27: "頤 - El Nutrirse",
    28: "大過 - El Exceso",
    29: "坎 - El Abismo",
    30: "離 - El Fuego",
    31: "咸 - La Influencia",
    32: "恆 - La Duración",
    33: "遯 - La Retirada",
    34: "大壯 - El Gran Poder",
    35: "晉 - El Progreso",
    36: "明夷 - El Oscurecimiento de la Luz",
    37: "家人 - La Familia",
    38: "睽 - La Oposición",
    39: "蹇 - El Obstáculo",
    40: "解 - La Liberación",
    41: "損 - La Pérdida",
    42: "益 - La Ganancia",
    43: "夬 - La Resolución",
    44: "姤 - El Encuentro",
    45: "萃 - La Reunión",
    46: "升 - El Ascenso",
    47: "困 - El Agotamiento",
    48: "井 - El Pozo de Agua",
    49: "革 - La Revolución",
    50: "鼎 - El Caldero",
    51: "震 - El Trueno",
    52: "艮 - La Montaña",
    53: "漸 - El Desarrollo Gradual",
    54: "歸妹 - El Matrimonio de la Doncella",
    55: "豐 - La Abundancia",
    56: "旅 - El Viajero",
    57: "巽 - El Viento",
    58: "兌 - El Lago",
    59: "涣 - La Dispersión",
    60: "節 - La Moderación",
    61: "中孚 - La Verdad Interior",
    62: "小過 - El Pequeño Exceso",
    63: "既濟 - La Conclusión",
    64: "未濟 - La Inconclusión"
}

# ----------------- Variables globales -----------------
question_hash = 0
lineas_hexagrama = []
historial_consultas = []

# ----------------- Función para actualizar el historial -----------------
def actualizar_historial(pregunta, hexagrama_original, hexagrama_mutado=None):
    entrada = f"Pregunta: {pregunta}\nOriginal: {hexagrama_original}"
    if hexagrama_mutado and hexagrama_original != hexagrama_mutado:
        entrada += f"\nMutado: {hexagrama_mutado}"
    entrada += "\n" + "-" * 40 + "\n"
    historial_consultas.append(entrada)
    text_historial.config(state=tk.NORMAL)
    text_historial.insert(tk.END, entrada)
    text_historial.config(state=tk.DISABLED)

# ----------------- Función para animar el dibujo (línea a línea) -----------------
def dibujar_hexagrama_animado(canvas, lineas, lineas_mutantes_idx=None, i=0):
    if i >= len(lineas):
        return
    if len(lineas) == 6:
        idx = 5 - i
        y = TOP_MARGIN + i * LINE_SPACING
    else:
        idx = i
        pos = 6 - (i + 1)
        y = TOP_MARGIN + pos * LINE_SPACING
    color = MUTANT_COLOR if (lineas_mutantes_idx and idx in lineas_mutantes_idx) else NORMAL_COLOR
    if lineas[idx] % 2 == 0:
        canvas.create_line(LEFT_MARGIN, y, LEFT_MARGIN + SEGMENT_LENGTH, y, fill=color, width=LINE_WIDTH)
        canvas.create_line(LEFT_MARGIN + SEGMENT_LENGTH + GAP_LENGTH, y, LEFT_MARGIN + SEGMENT_LENGTH*2 + GAP_LENGTH, y, fill=color, width=LINE_WIDTH)
    else:
        canvas.create_line(LEFT_MARGIN, y, LEFT_MARGIN + SEGMENT_LENGTH*2 + GAP_LENGTH, y, fill=color, width=LINE_WIDTH)
    canvas.after(500, dibujar_hexagrama_animado, canvas, lineas, lineas_mutantes_idx, i + 1)

# ----------------- Funciones de lanzamiento -----------------
def lanzar_moneda():
    global question_hash
    t = time.time()
    microsegundo = int((t - int(t)) * 1_000_000)
    secure_random = random.SystemRandom()
    # Combina tiempo, semilla y un valor aleatorio, y aplica SHA-256 para mejorar la mezcla.
    s = f"{microsegundo}{question_hash}{secure_random.randint(0,1000)}"
    hash_val = hashlib.sha256(s.encode()).hexdigest()
    first_digit = int(hash_val[0], 16)
    return 2 if (first_digit & 1) == 0 else 3

def generar_linea():
    resultados = [lanzar_moneda() for _ in range(3)]
    descripcion = ", ".join("yin" if r == 2 else "yang" for r in resultados)
    label_tiradas.config(text="Tiradas: " + descripcion)
    return sum(resultados)

def get_hexagrama_nombre(lineas):
    try:
        patron = ''.join('1' if valor % 2 else '0' for valor in lineas)
        num = KING_WEN_MAPPING.get(patron)
        if num is None:
            return f"Hexagrama desconocido para el patrón {patron}"
        nombre = HEXAGRAMAS.get(num, f"Hexagrama {num}")
        return f"{num}. {nombre}"
    except Exception as e:
        return f"Error al obtener hexagrama: {str(e)}"

def dibujar_hexagrama(canvas, lineas, lineas_mutantes_idx=None):
    canvas.delete("all")
    n = len(lineas)
    if n == 6:
        for i in range(6):
            idx = 5 - i
            y = TOP_MARGIN + i * LINE_SPACING
            color = MUTANT_COLOR if (lineas_mutantes_idx and idx in lineas_mutantes_idx) else NORMAL_COLOR
            if lineas[idx] % 2 == 0:
                canvas.create_line(LEFT_MARGIN, y, LEFT_MARGIN + SEGMENT_LENGTH, y, fill=color, width=LINE_WIDTH)
                canvas.create_line(LEFT_MARGIN + SEGMENT_LENGTH + GAP_LENGTH, y, LEFT_MARGIN + SEGMENT_LENGTH*2 + GAP_LENGTH, y, fill=color, width=LINE_WIDTH)
            else:
                canvas.create_line(LEFT_MARGIN, y, LEFT_MARGIN + SEGMENT_LENGTH*2 + GAP_LENGTH, y, fill=color, width=LINE_WIDTH)
    else:
        for i in range(n):
            pos = 6 - (i + 1)
            y = TOP_MARGIN + pos * LINE_SPACING
            color = MUTANT_COLOR if (lineas_mutantes_idx and i in lineas_mutantes_idx) else NORMAL_COLOR
            if lineas[i] % 2 == 0:
                canvas.create_line(LEFT_MARGIN, y, LEFT_MARGIN + SEGMENT_LENGTH, y, fill=color, width=LINE_WIDTH)
                canvas.create_line(LEFT_MARGIN + SEGMENT_LENGTH + GAP_LENGTH, y, LEFT_MARGIN + SEGMENT_LENGTH*2 + GAP_LENGTH, y, fill=color, width=LINE_WIDTH)
            else:
                canvas.create_line(LEFT_MARGIN, y, LEFT_MARGIN + SEGMENT_LENGTH*2 + GAP_LENGTH, y, fill=color, width=LINE_WIDTH)

def lanzar_y_mostrar():
    global question_hash
    if len(lineas_hexagrama) == 0:
        pregunta = entry_pregunta.get("1.0", tk.END).strip()
        if pregunta:
            label_pregunta.config(text="Pregunta: " + pregunta)
            question_hash = sum(ord(c) for c in pregunta)
        else:
            label_pregunta.config(text="Pregunta: (sin pregunta)")
            question_hash = 0
    if len(lineas_hexagrama) < 6:
        nueva_linea = generar_linea()
        lineas_hexagrama.append(nueva_linea)
        actualizar_texto()
        dibujar_hexagrama_animado(canvas_original, lineas_hexagrama)
        if len(lineas_hexagrama) == 6:
            lineas_mutantes = [i for i, valor in enumerate(lineas_hexagrama) if valor in (6, 9)]
            hexagrama_mutado = [7 if v == 6 else 8 if v == 9 else v for v in lineas_hexagrama]
            dibujar_hexagrama_animado(canvas_original, lineas_hexagrama, lineas_mutantes)
            nombre_original = get_hexagrama_nombre(lineas_hexagrama)
            nombre_mutado = get_hexagrama_nombre(hexagrama_mutado)
            label_original.config(text=f"Original: {nombre_original}")
            if lineas_hexagrama == hexagrama_mutado:
                label_mutado.config(text="Sin mutaciones")
                canvas_mutado.delete("all")
            else:
                label_mutado.config(text=f"Mutado: {nombre_mutado}")
                dibujar_hexagrama(canvas_mutado, hexagrama_mutado, lineas_mutantes)
            actualizar_historial(entry_pregunta.get("1.0", tk.END).strip(), nombre_original, nombre_mutado)

def actualizar_texto():
    resultado_label.config(text=f"Líneas generadas: {len(lineas_hexagrama)}/6")

def reiniciar():
    global question_hash
    lineas_hexagrama.clear()
    question_hash = 0
    resultado_label.config(text="Presiona el botón para generar una línea.")
    label_original.config(text="")
    label_mutado.config(text="")
    canvas_original.delete("all")
    canvas_mutado.delete("all")
    entry_pregunta.delete("1.0", tk.END)
    label_pregunta.config(text="")
    label_tiradas.config(text="")

# ----------------- INTERFAZ GRÁFICA -----------------
root = tk.Tk()
root.title("I Ching")
root.option_add("*Font", "Helvetica 14")

window_width = 735
window_height = 900
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
x = (screen_width - window_width) // 2
y = (screen_height - window_height) // 2
root.geometry(f"{window_width}x{window_height}+{x}+{y}")

label_intro = tk.Label(root, text="Introduce tu pregunta:")
label_intro.pack(pady=5)

entry_pregunta = tk.Text(root, width=80, height=3)
entry_pregunta.pack(pady=5)

label_pregunta = tk.Label(root, text="")
label_pregunta.pack(pady=5)

label_tiradas = tk.Label(root, text="")
label_tiradas.pack(pady=5)

boton_lanzar = tk.Button(root, text="Lanzar Monedas", command=lanzar_y_mostrar)
boton_lanzar.pack(pady=10)

resultado_label = tk.Label(root, text="Presiona el botón para generar una línea")
resultado_label.pack(pady=5)

# Frame contenedor horizontal
frame_hexagramas = tk.Frame(root)
frame_hexagramas.pack(pady=10)

# Hexagrama original (izquierda)
frame_original = tk.Frame(frame_hexagramas)
frame_original.pack(side=tk.LEFT, padx=10)

canvas_original = tk.Canvas(frame_original, width=330, height=330, bg="black")
canvas_original.pack()

label_original = tk.Label(frame_original, text="")
label_original.pack(pady=5)

# Hexagrama mutado (derecha)
frame_mutado = tk.Frame(frame_hexagramas)
frame_mutado.pack(side=tk.LEFT, padx=10)

canvas_mutado = tk.Canvas(frame_mutado, width=330, height=330, bg="black")
canvas_mutado.pack()

label_mutado = tk.Label(frame_mutado, text="")
label_mutado.pack(pady=5)

boton_reiniciar = tk.Button(root, text="Nueva Pregunta", command=reiniciar)
boton_reiniciar.pack(pady=10)

boton_salir = tk.Button(root, text="Salir", command=root.quit)
boton_salir.pack(pady=5)

label_historial = tk.Label(root, text="Historial de consultas:")
label_historial.pack(pady=5)

text_historial = tk.Text(root, width=80, height=6, state=tk.DISABLED)
text_historial.pack(pady=5)

root.mainloop()
