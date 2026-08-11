# Impresión de listas

Aplicación local para seleccionar varias listas PDF, unirlas en el orden mostrado y abrir el resultado para imprimirlo desde el navegador. La aplicación está pensada para Windows 10/11 y no utiliza base de datos ni almacena los PDFs descargados de forma permanente.

## Requisitos

- Node.js 18 o superior instalado desde [nodejs.org](https://nodejs.org/).
- Visual Studio Code.

## Instalación y ejecución

1. Abra esta carpeta en Visual Studio Code.
2. Abra una terminal en la carpeta del proyecto.
3. Ejecute `npm install`.
4. Ejecute `npm start`.
5. Abra [http://localhost:3000](http://localhost:3000) en el navegador.

En Windows, si PowerShell bloquea `npm.ps1`, ejecute `npm.cmd install` y `npm.cmd start`.

## Uso

Marque una o varias listas, o use **Seleccionar todas**. La selección respeta el orden en que las listas aparecen en pantalla. Pulse **Generar e imprimir** para que el servidor local descargue y combine los documentos. Cuando termine, use **Abrir PDF** o **Imprimir**; ambos abren el PDF en una nueva pestaña para que el navegador muestre su diálogo normal de impresión.

El botón **Ver PDF** abre la URL original en otra pestaña y no pasa por el backend ni inicia una descarga de combinación.

## Agregar listas

Edite `lists.json` y agregue objetos con esta estructura:

```json
{
  "name": "Lista nueva",
  "filename": "archivo.pdf",
  "url": "https://ejemplo.com/ruta/archivo.pdf"
}
```

La URL debe ser HTTPS. Al recargar la página, la interfaz lee el archivo actualizado automáticamente. El backend solo acepta URLs que existan exactamente en `lists.json`; no permite que el navegador solicite recursos arbitrarios.

## Seguridad y CORS

El navegador se comunica únicamente con `http://localhost:3000`. El servidor Node.js descarga los PDFs externos, valida HTTPS, el estado HTTP, la firma `%PDF-`, un timeout de 20 segundos y un máximo de 25 MB por archivo. Los documentos se mantienen en memoria durante la combinación y no se escriben en disco. Las redirecciones se rechazan para evitar salir de la lista permitida.

Esta arquitectura evita los problemas de CORS que aparecerían si el frontend intentara descargar directamente desde el servidor externo.

Si el servidor remoto rechaza las solicitudes de Node.js, la aplicación conserva las URLs configuradas y muestra el error HTTP o de red concreto en pantalla.