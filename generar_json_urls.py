import os
import json
import tkinter as tk
from tkinter import filedialog

ARCHIVO_JSON = 'fotos.json'

def seleccionar_txt_y_convertir():
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)

    print("Abriendo explorador de archivos...")
    
    ruta_txt = filedialog.askopenfilename(
        title="Selecciona el archivo TXT",
        filetypes=[("Archivos de texto", "*.txt"), ("Todos los archivos", "*.*")]
    )

    if not ruta_txt:
        print("\n⚠️ No seleccionaste ningún archivo.")
        return

    lista_media = []

    with open(ruta_txt, 'r', encoding='utf-8') as f:
        for linea in f:
            linea = linea.strip()
            if not linea:
                continue
            
            partes = [p.strip() for p in linea.split('|')]
            
            url = partes[0]
            titulo = partes[1] if len(partes) > 1 else ""
            ubicacion = partes[2] if len(partes) > 2 else ""
            fecha = partes[3] if len(partes) > 3 else ""
            descripcion = partes[4] if len(partes) > 4 else ""

            lista_media.append({
                "url": url,
                "titulo": titulo,
                "ubicacion": ubicacion,
                "fecha": fecha,
                "descripcion": descripcion
            })

    if not lista_media:
        print(f"\n⚠️ El archivo '{os.path.basename(ruta_txt)}' está vacío.")
        return

    with open(ARCHIVO_JSON, 'w', encoding='utf-8') as f:
        json.dump(lista_media, f, ensure_ascii=False, indent=2)

    print(f"\n✅ ¡Éxito! Se procesaron {len(lista_media)} elementos y se guardaron en '{ARCHIVO_JSON}'.")

if __name__ == '__main__':
    seleccionar_txt_y_convertir()