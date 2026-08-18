import os
import json
import tkinter as tk
from tkinter import filedialog

ARCHIVO_JSON = 'fotos.json'

def seleccionar_txt_y_convertir():
    # Ocultar la ventana principal de tkinter
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True) # Forzar a que la ventana aparezca al frente

    print("Abriendo el explorador de archivos...")
    
    # Abrir el cuadro de diálogo para seleccionar el archivo .txt
    ruta_txt = filedialog.askopenfilename(
        title="Selecciona el archivo TXT con las URLs",
        filetypes=[("Archivos de texto", "*.txt"), ("Todos los archivos", "*.*")]
    )

    # Si el usuario cierra el explorador sin seleccionar nada
    if not ruta_txt:
        print("\n⚠️ No seleccionaste ningún archivo.")
        return

    # Leer las URLs del archivo TXT seleccionado
    with open(ruta_txt, 'r', encoding='utf-8') as f:
        urls = [linea.strip() for linea in f if linea.strip()]

    if not urls:
        print(f"\n⚠️ El archivo '{os.path.basename(ruta_txt)}' está vacío.")
        return

    # Guardar la lista de URLs en fotos.json
    with open(ARCHIVO_JSON, 'w', encoding='utf-8') as f:
        json.dump(urls, f, ensure_ascii=False, indent=2)

    print(f"\n✅ ¡Éxito! Se procesaron {len(urls)} URLs desde '{os.path.basename(ruta_txt)}' y se guardaron en '{ARCHIVO_JSON}'.")

if __name__ == '__main__':
    seleccionar_txt_y_convertir()