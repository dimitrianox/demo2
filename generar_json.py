import os
import json

# Carpeta donde están tus fotos
CARPETA_MEDIA = 'media'
ARCHIVO_JSON = 'fotos.json'

# Extensiones de imagen permitidas
EXTENSIONES_PERMITIDAS = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp')

def generar_lista_fotos():
    if not os.path.exists(CARPETA_MEDIA):
        print(f"La carpeta '{CARPETA_MEDIA}' no existe. Por favor créala y pon ahí tus imágenes.")
        return

    # Escanear archivos de la carpeta
    archivos = [
        archivo for archivo in os.listdir(CARPETA_MEDIA)
        if archivo.lower().endswith(EXTENSIONES_PERMITIDAS)
    ]

    # Guardar en fotos.json
    with open(ARCHIVO_JSON, 'w', encoding='utf-8') as f:
        json.dump(archivos, f, ensure_ascii=False, indent=2)

    print(f"¡Listo! Se registraron {len(archivos)} imágenes en '{ARCHIVO_JSON}'.")

if __name__ == '__main__':

    generar_lista_fotos()