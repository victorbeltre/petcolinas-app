# Mapa de reconocimiento: PetFinanzas (facturacion electronica RD, web)

Alcance: emision y recepcion de e-CF ante la DGII (tipos 31, 32, 33, 34, 41, 43),
firma digital, envio y consulta de estado, representacion impresa con QR, y
reportes 606/607. Interfaz inspirada en los patrones de Alegra (RD), con marca propia.
Para: primero PetColinas (uso propio); despues, PetFinanzas como producto para vender
a otros negocios de RD.
Fecha: 2026-10-29

> Alcance PROPUESTO, no confirmado: plataforma web (sin app movil), la parte de
> "facturar y cumplir con la DGII" de Alegra, sin su contabilidad completa
> (catalogo de cuentas, asientos, conciliacion bancaria). Victor debe decir si o no.

## Lo primero: cuatro hallazgos que cambian el plan

1. **El XML de la DGII NO es UBL.** La DGII publica sus propios esquemas XSD, uno
   por tipo de e-CF (y otros para RFCE, aprobacion comercial, acuse de recibo y
   anulacion). La firma es XMLDSig *enveloped* sobre ese XML, con un certificado de
   una entidad autorizada por INDOTEL, sin preservar espacios en blanco, y el XML no
   se puede tocar despues de firmado. Si se genera UBL, la DGII lo rechaza.
   Fuente: Descripcion Tecnica de Facturacion Electronica v1.6 (DGII, jun 2023).
2. **El plazo de PetColinas vence el 15 de noviembre de 2026, en 17 dias.**
   Pequeños, micro y no clasificados pasaron del 15 may 2026 al 15 nov 2026 (Aviso
   06-26), y la prensa dice que no habra otra prorroga. Construir esto desde cero y
   certificarlo (la certificacion sola toma 2-4 semanas segun Alegra) NO cabe en 17
   dias. **PetColinas necesita un puente:** un proveedor ya certificado (Alegra u
   otro) o el facturador gratuito de la DGII, mientras PetFinanzas se construye.
   Hay que confirmar con la DGII o el contador en que grupo esta PetColinas.
   Grandes locales y medianos: solo e-CF desde el 1 nov 2026 (la serie B deja de
   valer el 31 oct 2026).
3. **Un emisor 100% electronico NO presenta el 607 (ni el 608).** Sus ventas ya le
   llegan a la DGII una por una. Lo que queda es: llenar a mano ciertas casillas del
   Anexo A del IT-1, y el 606, que SIGUE siendo obligatorio e incluye los NCF serie B
   y E recibidos. El 607 solo hace falta mientras se siga facturando con serie B
   (transicion) o para clientes de PetFinanzas que aun no son electronicos.
   Fuentes: blogs contables (Siempre al Dia), sin la norma original a la mano.
   **Verificar con el contador.**
4. **Vender PetFinanzas a terceros es una actividad regulada.** La Ley 32-23
   contempla a los proveedores de servicios de facturacion electronica, y estos
   necesitan autorizacion de la DGII. Para uso propio basta con que PetColinas se
   certifique como emisor electronico. Para venderlo hay que tramitar esa
   autorizacion; es requisito legal, no una funcion que se programa.
   **Verificar el articulo exacto y el procedimiento.**

## Fuentes

No se uso ninguna cuenta de Alegra: sus terminos pueden prohibir usar la cuenta para
construir un producto que compita, asi que todo sale de fuentes publicas. Esta sesion
no pudo abrir dgii.gov.do ni siemprealdia.co (bloqueados por la red del entorno);
los datos de esos sitios vienen de los extractos del buscador. No hay capturas en
`screens/`.

| # | fuente | URL | notas |
| --- | --- | --- | --- |
| 1 | DGII, Descripcion Tecnica de Facturacion Electronica v1.6 | https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Documentacin%20sobre%20eCF/Informe%20y%20Descripci%C3%B3n%20T%C3%A9cnica/Descripcion-tecnica-de-facturacion-electronica.pdf | nombre de archivos, firma, servicios. Leer completo antes de /replica-architect |
| 2 | DGII, Descripcion Tecnica Servicios DGII | https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Documentacin%20sobre%20eCF/Informe%20y%20Descripci%C3%B3n%20T%C3%A9cnica/Descripcion%20Tecnica%20Servicios%20DGII.pdf | semilla, recepcion, TrackId, consulta |
| 3 | DGII, Informe Tecnico e-CF v1.0 | https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Documentacin%20sobre%20eCF/Informe%20y%20Descripci%C3%B3n%20T%C3%A9cnica/Informe%20T%C3%A9cnico%20e-CF%20v1.0.pdf | campos por tipo; hay version 2026 con cambios (directorio por RNC) |
| 4 | DGII, Proceso de Certificacion para ser Emisor Electronico | https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Documentacin%20sobre%20eCF/Documentaciones%20Proceso%20de%20Certificaci%C3%B3n%20FE/Proceso%20de%20Certificacion%20para%20ser%20Emisor%20Electronico.pdf | pasos de la certificacion |
| 5 | DGII, Swagger de RecepcionFC (RFCE) | https://fc.dgii.gov.do/ecf/RecepcionFC/help/index.html | API publica, resumen de factura de consumo |
| 6 | DGII Ayuda, razones de rechazo (CA4404) | https://ayuda.dgii.gov.do/conversations/facturacin-electrnica/ca4404-por-cules-razones-la-dgii-puede-rechazar-un-ecf/6786cf2837f1fe2470e12c8a | estados y rechazos |
| 7 | DGII Ayuda, foro facturacion electronica | https://ayuda.dgii.gov.do/conversations/discusiones/facturacin-electrnica/6872664619faf82ed781658c | anulacion: solo firmados no enviados; despues, E34 |
| 8 | DGII, Formatos de envio de datos | https://dgii.gov.do/cicloContribuyente/obligacionesTributarias/remisionInformacion/Paginas/formatoEnvioDatos.aspx | 606/607/608, herramienta de pre-validacion |
| 9 | DGII, Llenado y envio Formato 606 | https://dgii.gov.do/publicacionesOficiales/bibliotecaVirtual/contribuyentes/formatoEnvioDatos/Documents/4-LlenadoyEnvioFormato606.pdf | columnas y codigos del 606 |
| 10 | Siempre al Dia, calendario e-CF 2026 | https://siemprealdia.co/republica-dominicana/impuestos/calendario-de-implementacion-de-facturacion-electronica/ | 15 nov 2026 pequeños/micro |
| 11 | Siempre al Dia, sin mas prorroga | https://siemprealdia.co/republica-dominicana/impuestos/no-habra-mas-prorroga-para-la-facturacion-electronica/ | |
| 12 | Siempre al Dia, cierre mensual 606/607/Anexo A | https://siemprealdia.co/republica-dominicana/impuestos/cierre-mensual-ante-la-dgii/ | emisor e-CF no presenta 607/608 |
| 13 | Siempre al Dia, conciliacion ITBIS e-CF | https://siemprealdia.co/republica-dominicana/impuestos/conciliacion-del-itbis-dgii/ | |
| 14 | Siempre al Dia, exencion retencion ITBIS con emisores e-CF | https://siemprealdia.co/republica-dominicana/impuestos/exencion-de-retencion-del-itbis-en-el-606-emisores-e-cf/ | Norma General 02-2026 (desde 16 sep 2026) |
| 15 | Siempre al Dia, reglamentacion (Decreto 587-24) | https://siemprealdia.co/republica-dominicana/impuestos/reglamentacion-de-la-ley-de-facturacion-electronica/ | art. 7: nuevos inscritos, 120 dias |
| 16 | elDinero, Reglamento 587-24 | https://eldinero.com.do/301380/reglamento-587-24-pilar-de-la-facturacion-electronica-en-la-republica-dominicana/ | |
| 17 | Presidencia, grandes locales y medianos | https://presidencia.gob.do/noticias/dgii-informa-emision-exclusiva-de-facturas-electronicas-para-grandes-locales-y-medianos | solo e-CF desde 1 nov 2026 |
| 18 | Blog Alegra RD, e-CF | https://blog.alegra.com/republica-dominicana/e-cf-republica-dominicana/ | tipos, flujo de habilitacion, 2-4 semanas |
| 19 | Blog Alegra RD, emisor electronico | https://blog.alegra.com/republica-dominicana/factura-electronica-republica-dominicana-emisor-electronico/ | pasos en la Oficina Virtual |
| 20 | Blog Alegra RD, reportes 606/607/608 | https://blog.alegra.com/republica-dominicana/reportes-contables-606-607-608/ | dice que los genera automaticamente |
| 21 | LLB Solutions, cambios Informe Tecnico 2026 | https://llbsolutions.com/es/republica-dominicana-cambios-informe-tecnico-ecf-dgii/ | resumen de cambios del esquema |
| 22 | PetColinas, capturas de Alegra de Victor (M25-M27) | CLAUDE.md del repo `petcolinas` | patrones de Cotizaciones, OC y CxP ya construidos |

Los patrones de pantallas de Alegra (menu Ingresos/Gastos/Contactos/Inventario/
Reportes, lista con estado y acciones, formulario de documento con lineas, impuestos
y retenciones) salen de las capturas que Victor ya paso para M25-M27 y de los blogs
publicos. Confianza media: el menu exacto de Alegra RD no aparece en fuentes publicas.

## Ciclo principal

Emitir una factura que la DGII acepta: elegir cliente y productos, y la app escoge
el tipo (31 si el cliente tiene RNC y pide credito fiscal, si no 32), toma el
siguiente e-NCF del rango, arma el XML, lo firma, lo envia, consulta el estado y
entrega el PDF con QR, todo en un clic y sin que el usuario sepa que es un XML.

## Tipos de e-CF del alcance

| tipo | nombre | quien lo emite | nota |
| --- | --- | --- | --- |
| 31 | Factura de Credito Fiscal Electronica | vendedor, a un contribuyente con RNC | da derecho a credito de ITBIS al comprador |
| 32 | Factura de Consumo Electronica | vendedor, a consumidor final | menor de RD$250,000: se envia un RESUMEN (RFCE) a RecepcionFC; mayor o igual: e-CF completo |
| 33 | Nota de Debito Electronica | vendedor | aumenta un e-CF ya emitido (referencia + codigo de modificacion) |
| 34 | Nota de Credito Electronica | vendedor | disminuye o anula un e-CF YA ENVIADO (no hay "anular" despues de enviar) |
| 41 | Comprobante Electronico de Compras | el COMPRADOR, al comprarle a quien no emite comprobantes (persona fisica no registrada) | autofactura; normalmente con retenciones |
| 43 | Comprobante Electronico para Gastos Menores | el comprador | gastos menores del personal (peajes, parqueos, etc.) |

Fuera del alcance pedido, pero existen: 44 Regimenes Especiales, 45 Gubernamental
(obligatorio para venderle al Estado, circular DGII-DGCP nov 2025), 46 Exportaciones
y 47 Pagos al Exterior. Ver la matriz.

## Servicios de la DGII (lo que la app consume)

Tres ambientes: **TesteCF** (pre-certificacion), **CerteCF** (certificacion) y
**eCF** (produccion). Confianza alta en los nombres, media en las rutas exactas
(salen de la v1.5 de 2023 y el Informe Tecnico 2026 cambio algunas).

```
Autenticacion   GET semilla -> firmar la semilla con el certificado -> POST validacioncertificado -> token (vence, hay que renovarlo)
Recepcion e-CF  POST XML firmado -> TrackId
Consulta        GET estado por TrackId -> Aceptado | Aceptado Condicional | Rechazado | En Proceso (+ mensajes)
RecepcionFC     POST RFCE (resumen de factura de consumo < RD$250,000), respuesta inmediata
Aprob. comercial  POST ACECF firmado (el receptor acepta o rechaza un e-CF que le enviaron)
Directorio      consulta por RNC: si un contribuyente es receptor electronico y sus URL de recepcion/aprobacion
Anulacion (ANECF) secuencias firmadas NO enviadas (rango sin usar); lo enviado se corrige con E34
```

**Lo que la app tiene que EXPONER** (todo emisor electronico es tambien receptor):
una URL publica de recepcion (otros emisores le envian e-CF y ella responde con un
acuse de recibo ARECF firmado), una de aprobacion comercial y una de autenticacion
por semilla. Esas URL se registran en la DGII durante la certificacion. En un
producto para vender, son URL por cliente (por RNC).

**Representacion impresa:** PDF con el QR que lleva a la consulta del timbre en la
DGII (RNC emisor, RNC comprador, e-NCF, fecha de emision, monto total, fecha de
firma, codigo de seguridad) y el codigo de seguridad impreso: los primeros 6
caracteres del hash de la firma (SignatureValue). Confianza media: confirmar
contra la v1.6 y el Informe Tecnico 2026.

**Nombre de archivo:** `<RNC emisor><e-NCF>.xml`, p. ej. `101672919E310000000001.xml`.

**Certificacion de PetColinas** (Fuente 4; pasos de memoria, confianza media):
solicitud en la Oficina Virtual -> pruebas de datos (un set de e-CF que la DGII da)
-> pruebas de aprobacion comercial -> simulacion -> validacion de representacion
impresa -> validacion de las URL de servicios -> declaracion jurada -> autorizado.

## Pantallas

| ID | pantalla | ruta / como se llega | proposito | componentes clave | estados vistos |
| --- | --- | --- | --- | --- | --- |
| S01 | Entrada | /login | sesion | Input, Btn, aviso | vacio, error, sesion vencida, movil |
| S02 | Alta de empresa | primera entrada | RNC, razon social, nombre comercial, direccion, actividad, logo | Input RNC con consulta, Select, subida de logo | vacio, RNC invalido, RNC no encontrado, lleno |
| S03 | Certificado digital | Configuracion -> Certificado | subir .p12 + clave, ver titular y vencimiento | subida, Input clave, tarjeta de estado | sin certificado, valido, por vencer (<30 dias), vencido, clave incorrecta, RNC distinto |
| S04 | Asistente de certificacion DGII | Configuracion -> Facturacion electronica | guiar los pasos ante la DGII, correr el set de pruebas en TesteCF/CerteCF, mostrar las URL a registrar | Stepper, tabla de resultados, Badge, copiar URL | no iniciado, en curso por paso, paso fallido con mensajes DGII, autorizado |
| S05 | Numeraciones e-NCF | Configuracion -> Numeraciones | rangos autorizados por tipo (desde, hasta, vencimiento), cuantos quedan | Table, Modal nuevo rango, barra de uso | vacio, activo, por agotarse, agotado, vencido, rango anulado |
| S06 | Inicio | / | ventas del mes, por cobrar, e-CF rechazados o pendientes, vence certificado/rango, proximos 606 | tarjetas KPI, lista de alertas | sin datos, lleno, con alertas |
| S07 | Facturas de venta | Ingresos -> Facturas | lista de 31/32 con estado DGII y de cobro | Table, filtros (fecha, tipo, estado, cliente), Badge estado, acciones | vacio, cargando, lleno, filtrado sin resultados |
| S08 | Nueva factura | Ingresos -> Facturas -> Nueva | emitir 31/32 | buscador de cliente, tipo sugerido, lineas (producto, cant, precio, desc %, ITBIS 18/16/exento), retenciones, forma y condicion de pago, notas, totales | vacio, lleno, cliente sin RNC (fuerza 32), >= RD$250,000 en 32 (exige identificacion del comprador), sin rango disponible, error de validacion |
| S09 | Detalle del e-CF | clic en una factura | ver el documento y su historia ante la DGII | encabezado con e-NCF y Badge, linea de tiempo (firmado, enviado, TrackId, respuesta), mensajes DGII, botones: PDF, XML, WhatsApp/correo, nota de credito, nota de debito, reintentar | en proceso, aceptado, aceptado condicional (con mensajes), rechazado (con causa y "corregir con nueva factura"), en contingencia |
| S10 | Representacion impresa | S09 -> PDF | factura para el cliente | logo, datos fiscales, QR, codigo de seguridad, fecha de firma | carta, ticket 80 mm |
| S11 | Notas de credito | Ingresos -> Notas de credito | E34 contra un e-CF | buscador de e-CF a afectar, codigo de modificacion (anula total, corrige texto, corrige montos), lineas, totales | vacio, lleno, sobrepasa el original, original rechazado |
| S12 | Notas de debito | Ingresos -> Notas de debito | E33 contra un e-CF | igual a S11 | igual a S11 |
| S13 | Pagos recibidos | Ingresos -> Pagos recibidos | cobrar facturas a credito, total o abono | Table, Modal pago, forma de pago | vacio, lleno, saldo cero |
| S14 | Contactos | Contactos | clientes y proveedores con RNC/cedula, tipo de identificacion, si es receptor electronico | Table, ficha, consulta RNC/directorio | vacio, lleno, RNC invalido, duplicado |
| S15 | Facturas de proveedor | Gastos -> Facturas de proveedor | registrar compras (NCF serie B o E) para el 606: tipo de bienes y servicios, ITBIS, retenciones, forma de pago | formulario de compra, lineas, Select tipo 01-11 | vacio, lleno, NCF invalido, NCF duplicado |
| S16 | e-CF recibidos | Gastos -> Recibidos | bandeja de e-CF que los proveedores enviaron a la URL de recepcion; aceptar o rechazar (aprobacion comercial) y pasarlos a compras | Table, visor del e-CF, Btn aceptar/rechazar con motivo | vacio, nuevo, aceptado, rechazado, vencio el plazo |
| S17 | Comprobante de compras (41) | Gastos -> Comprobante de compras | autofactura al comprarle a un informal | formulario con cedula del vendedor, lineas, retenciones ISR/ITBIS | vacio, lleno, cedula invalida |
| S18 | Gastos menores (43) | Gastos -> Gastos menores | registrar gastos menores del personal | formulario simple, adjunto de recibo | vacio, lleno |
| S19 | Productos y servicios | Inventario | catalogo con precio, impuesto e indicador bien/servicio | Table, Modal | vacio, lleno |
| S20 | Reporte 606 | Reportes -> 606 | compras del periodo, validacion fila por fila, exportar TXT de la DGII | Select periodo, Table, lista de errores, Btn exportar | sin compras (606 en cero), con errores, valido |
| S21 | Reporte 607 | Reportes -> 607 | ventas serie B del periodo; aviso si la empresa es 100% electronica (no aplica) | igual a S20 | no aplica (100% e-CF), con errores, valido |
| S22 | Ayuda Anexo A / IT-1 | Reportes -> ITBIS del mes | totales del mes listos para copiar a las casillas del Anexo A | tabla de casillas con montos | sin datos, lleno |
| S23 | Envios a la DGII | Configuracion -> Bitacora DGII | cola de envios: intentos, respuestas, reintentos, contingencia | Table, filtros, Btn reintentar | vacio, en cola, con errores, DGII sin servicio |
| S24 | Impuestos y retenciones | Configuracion -> Impuestos | ITBIS 18/16/0, ISR 10/2/27, ITBIS retenido 30/100 | Table, Modal | por defecto, editado |
| S25 | Usuarios y roles | Configuracion -> Usuarios | admin, facturador, contador (solo lectura + reportes) | Table, Modal invitacion | uno solo, varios |
| S26 | Plantilla de factura | Configuracion -> Plantilla | logo, colores, pie, terminos | vista previa | por defecto, personalizada |

26 pantallas.

## Flujos

```
F01 Dejar la empresa lista para facturar en electronico
    S02 -> S03 -> S04 (pasos DGII con set de pruebas) -> S05 -> S06
    clics del camino feliz: ~25 (mas los dias de espera de la DGII)
    borde: certificado de otro RNC, clave incorrecta, certificado vencido, la DGII rechaza
           un caso del set, URL de recepcion no responde cuando la DGII la prueba

F02 Venderle a una empresa (E31)
    S07 -> S08 (cliente con RNC, lineas) -> Emitir -> S09 -> PDF/WhatsApp
    clics del camino feliz: 7
    borde: RNC no existe o esta suspendido, rango agotado o vencido, token vencido a mitad
           del envio, DGII responde "En Proceso" largo rato, Aceptado Condicional, Rechazado

F03 Venderle a un consumidor (E32)
    S08 (sin cliente o con nombre) -> Emitir -> S10 ticket
    clics del camino feliz: 5
    borde: total >= RD$250,000 (va como e-CF completo, pide identificacion del comprador),
           sin internet o DGII caida (contingencia: se firma, se entrega y se envia despues)

F04 Anular o corregir una factura ya enviada (E34)
    S09 -> Nota de credito -> S11 (codigo de modificacion) -> Emitir -> S09 de la nota
    clics del camino feliz: 5
    borde: la factura aun no se ha enviado (eso se anula con ANECF, no con E34),
           monto mayor al original, la factura original estaba rechazada

F05 Cobrar de mas o agregar un cargo (E33)
    S09 -> Nota de debito -> S12 -> Emitir
    clics del camino feliz: 5

F06 Recibir el e-CF de un proveedor y aprobarlo
    (proveedor envia a nuestra URL) -> ARECF automatico -> S16 -> Aceptar/Rechazar (ACECF) -> S15
    clics del camino feliz: 3
    borde: e-CF con firma invalida, dirigido a otro RNC, duplicado, se vence el plazo de respuesta

F07 Comprarle a un informal (E41)
    S17 (cedula, lineas, retencion) -> Emitir -> S09
    clics del camino feliz: 6
    borde: cedula invalida, retencion obligatoria no marcada

F08 Registrar un gasto menor (E43)
    S18 -> Emitir
    clics del camino feliz: 4

F09 Presentar el 606 del mes
    S20 (periodo) -> revisar errores -> corregir en S15 -> Exportar TXT -> (subir en la Oficina Virtual a mano)
    clics del camino feliz: 4
    borde: mes sin compras (606 en cero), NCF duplicado, RNC invalido, fecha de pago antes de la factura

F10 Presentar el 607 del mes (solo si todavia hay serie B)
    S21 -> Exportar TXT
    clics del camino feliz: 3
    borde: empresa 100% electronica (la pantalla dice que no aplica)

F11 Corregir un e-CF rechazado
    S06 alerta -> S09 (mensajes de la DGII) -> emitir uno nuevo corregido (nuevo e-NCF)
    clics del camino feliz: 6
    borde: el e-NCF rechazado queda usado; no se reutiliza

F12 Renovar certificado o pedir un rango nuevo
    S06 alerta -> S03 o S05
```

## Componentes

| componente | variantes | estados | usado en |
| --- | --- | --- | --- |
| Btn | primario, secundario, fantasma, peligro | normal, hover, foco, deshabilitado, cargando | todas |
| Input | texto, numero, dinero RD$, fecha, RNC/cedula con validacion | normal, foco, error, deshabilitado | todas |
| Select / Combobox con busqueda | simple, con crear nuevo | abierto, vacio, sin resultados | S08, S11-S18 |
| Badge estado DGII | Aceptado, Aceptado condicional, Rechazado, En proceso, En contingencia, Borrador | | S07, S09, S16, S23 |
| Table | con filtros, paginada, con acciones por fila | cargando, vacia, llena | S05, S07, S11-S16, S19-S25 |
| Editor de lineas | venta, compra | vacio, con errores por linea | S08, S11, S12, S15, S17, S18 |
| Bloque de totales | con retenciones | | S08, S11, S12, S15, S17 |
| Linea de tiempo DGII | | | S09, S23 |
| Stepper | | paso hecho, actual, fallido | S04 |
| Modal | formulario, confirmacion | | varias |
| Toast | exito, error, aviso | | todas |
| Tarjeta KPI | dinero, conteo, alerta | | S06 |
| Selector de periodo | mes | | S20, S21, S22 |
| Menu lateral | grupos: Inicio, Ingresos, Gastos, Contactos, Inventario, Reportes, Configuracion | activo | todas |

Nota: PetColinas ya tiene Card/Btn/Badge/Input/Select "moderno y limpio" (etapa 1,
28 oct 2026) y los patrones de Cotizaciones/OC/CxP calcados de Alegra
(`calcularCotizacion` hace lineas, descuento, ITBIS y retenciones). Se pueden reusar.

## Modelo de datos inferido

```
Empresa         id, rnc, razon_social, nombre_comercial, direccion, municipio, provincia,
                telefono, correo, actividad, logo, es_emisor_electronico, fecha_autorizacion,
                ambiente (TesteCF | CerteCF | eCF), url_recepcion, url_aprobacion
                evidencia: S02, S04, campos del emisor en el XML (Informe Tecnico)
                confianza: alta

Certificado     id, empresa_id, archivo_p12 (cifrado), clave (cifrada), titular, rnc_titular,
                emitido_por, valido_desde, valido_hasta
                evidencia: S03, firma XMLDSig (Descripcion Tecnica)
                confianza: alta

Secuencia       id, empresa_id, tipo_ecf (31|32|33|34|41|43|...), desde, hasta, siguiente,
                vence, estado (activa | agotada | vencida | anulada)
                evidencia: S05, formato E + tipo + 10 digitos (E310000000001)
                confianza: alta

Contacto        id, empresa_id, tipo_id (RNC | cedula | pasaporte), identificacion, nombre,
                es_cliente, es_proveedor, es_receptor_electronico, url_recepcion (del directorio),
                correo, telefono, direccion
                evidencia: S14, Directorio DGII
                confianza: alta

Producto        id, empresa_id, nombre, indicador_bien_servicio, precio, itbis_tasa, unidad
                evidencia: S19, campo IndicadorBienoServicio del detalle del e-CF
                confianza: media (nombre de campo por confirmar en el XSD)

Documento       id, empresa_id, tipo_ecf, encf, fecha_emision, contacto_id, condicion_pago,
                (e-CF)      tipo_pago, tipo_ingreso, fecha_limite_pago,
                monto_gravado_18, monto_gravado_16, monto_gravado_0, monto_exento,
                itbis_18, itbis_16, itbis_total, retencion_itbis, retencion_isr, monto_total,
                encf_modificado, fecha_ncf_modificado, codigo_modificacion (para 33/34),
                xml_firmado (ruta), fecha_firma, codigo_seguridad, track_id,
                estado_dgii (borrador | firmado | enviado | aceptado | aceptado_condicional |
                rechazado | contingencia | anulado), mensajes_dgii (json),
                es_resumen_rfce (32 < 250k), creado_por
                evidencia: S08-S12, S17, S18, Informe Tecnico (Encabezado/Totales),
                           servicio de consulta por TrackId
                confianza: alta en la forma, media en los nombres exactos (salen del XSD)

LineaDocumento  id, documento_id, numero_linea, producto_id, nombre, indicador_bien_servicio,
                cantidad, unidad, precio_unitario, descuento, itbis_tasa, monto_item
                evidencia: S08, seccion DetallesItems del e-CF
                confianza: alta

EnvioDGII       id, documento_id, servicio (recepcion | recepcionfc | aprobacion | anulacion),
                ambiente, intento, enviado_at, http_status, respuesta (json), track_id
                evidencia: S23, necesidad de reintentos y contingencia
                confianza: media (diseño propio, no lo exige la DGII)

TokenDGII       empresa_id, ambiente, token, vence_at
                evidencia: servicio de autenticacion por semilla
                confianza: alta

DocumentoRecibido id, empresa_id, rnc_emisor, encf, tipo_ecf, fecha_emision, monto_total,
                xml (ruta), firma_valida, acuse_enviado_at (ARECF),
                aprobacion (pendiente | aceptado | rechazado), motivo_rechazo, compra_id
                evidencia: S16, servicios de recepcion y aprobacion comercial
                confianza: alta

Compra          id, empresa_id, contacto_id, ncf (B o E), ncf_modificado, tipo_bienes_servicios (01-11),
                (606)       fecha_comprobante, fecha_pago, monto_servicios, monto_bienes, itbis_facturado,
                itbis_retenido, itbis_proporcionalidad, itbis_al_costo, itbis_por_adelantar,
                itbis_percibido, tipo_retencion_isr, retencion_isr, isr_percibido,
                impuesto_selectivo, otros_impuestos, propina_legal, forma_pago (01-07),
                documento_recibido_id, documento_id (si es un 41/43 propio)
                evidencia: S15, columnas del Formato 606 (Fuente 9)
                confianza: alta en las columnas, media en los codigos (leer el instructivo vigente)

Pago            id, documento_id, fecha, monto, forma_pago, referencia
                evidencia: S13
                confianza: alta

Reporte         id, empresa_id, formato (606 | 607), periodo (AAAAMM), filas, errores (json),
                archivo_txt, generado_at, generado_por
                evidencia: S20, S21
                confianza: alta

Usuario/Rol     usuario_id, empresa_id, rol (admin | facturador | contador)
                evidencia: S25
                confianza: alta
```

Relaciones: Empresa 1-n Certificado, Secuencia, Contacto, Producto, Documento,
DocumentoRecibido, Compra, Reporte. Documento 1-n LineaDocumento, EnvioDGII, Pago.
Documento (33/34) n-1 Documento (el que modifica). DocumentoRecibido 0-1 Compra.
Documento (41/43) 1-1 Compra (entra al 606).

## Lo que ya existe en PetColinas y se conecta

- Facturas, NCF serie B y rangos (M16): hoy salen sin comprobante si no hay rango
  cargado. Con e-CF la serie B deja de servir; las Facturas pasan a emitir e-CF.
- `pc_compras` (facturas de proveedor cargadas en Inventario y OC recibidas),
  `pc_gastos` y `pc_cuentas_pagar` (M23, M26, M27): son la materia prima del 606.
  Hoy no guardan tipo de bienes y servicios (01-11), ITBIS separado ni NCF del
  proveedor de forma consistente: hay que añadirlos.
- `calcularCotizacion` (ITBIS 18 %, ISR 10/2 %, ITBIS retenido 30/100 %) sirve
  para los totales.

## Matriz de funciones

Ver `features.csv`. Must: 33, should: 15, could: 9, skip: 6.

## Fuera de alcance (no se puede o no se debe clonar)

- La certificacion de Alegra y su autorizacion como proveedor: cada emisor se
  certifica solo, y PetFinanzas tiene que tramitar la suya para venderse.
- El certificado digital: lo emite una entidad autorizada por INDOTEL a nombre de
  cada empresa. La app lo guarda y lo usa; no lo puede crear.
- La presentacion del 606/607 en la Oficina Virtual: la DGII no tiene API publica
  para eso. La app genera el TXT valido; alguien lo sube a mano.
- El IT-1: se declara en la Oficina Virtual. La app solo prepara los montos.
- La contabilidad completa de Alegra (catalogo de cuentas, asientos, conciliacion
  bancaria, nomina electronica), su marca, textos e iconos.
- La red de contadores y aliados de Alegra.

## Tamaño

Pantallas 26, flujos 12, entidades 14.

Partes dificiles:
1. **Firma XMLDSig exacta y XML que pase el XSD.** Un byte mal canonicalizado y la
   DGII rechaza todo. Necesita servidor (la clave del .p12 NO puede ir al navegador)
   y pruebas contra TesteCF con el set oficial.
2. **Ser receptor:** URL publicas siempre arriba que reciben e-CF de terceros,
   validan su firma y responden con ARECF firmado. Por empresa, si se vende.
3. **Certificacion ante la DGII** (dias o semanas de espera que no dependen de
   nosotros) y, para vender, la autorizacion como proveedor de servicios.
4. Cola de envios con reintentos, token que vence y contingencia (DGII caida),
   sin emitir dos veces el mismo e-NCF.
5. Custodia del certificado y la clave (cifrado, acceso solo-admin, RLS; ver
   Regla Critica 6).

Tamaño: **L** para el motor de e-CF de PetColinas (6 tipos, receptor, 606/607,
un solo RNC). **XL** para PetFinanzas como producto para vender (varias empresas,
URL por empresa, autorizacion de la DGII, soporte, facturacion del servicio):
**reducir el alcance**. Ninguno de los dos llega al 15 nov 2026.

Reduccion propuesta: (1) ya, antes del 15 nov: PetColinas factura con un proveedor
certificado o el facturador de la DGII. (2) Construir el motor (31/32/34 + receptor
+ 606) solo para PetColinas y certificarlo. (3) Despues 33/41/43 y 607. (4) Solo
entonces, varias empresas y la autorizacion para venderlo como PetFinanzas.
