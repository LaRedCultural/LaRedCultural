# **La Red Cultural**

# **Descripción general**

La Red Cultura (en adelante LRC), se origina a partir de la necesidad de conectar a las personas con la cultura, sea entendida ésta última como  el conjunto de conocimientos, creencias, arte, leyes, costumbres, idioma y hábitos que un grupo de personas aprende y comparte en una sociedad.

LRC nace con el objetivo de conectar eventos/actividades con personas que desean participar de ellas a través de una plataforma digital que promueva el contacto entre intereses mutuos.

# **Metas**

1. Crear una red de personas interesadas por la cultura en todas sus formas, mediante un registro sencillo dentro de LRC.

2. Permitir creación de eventos.

3. Habilitar a los creadores de eventos, publicitarlos en LRC.

4. Habilitar a los creadores de eventos lanzar campañas de publicidad mediante envío de notificación solicitando confirmación de asistencia mediante encuesta (link a URL autenticada dentro del sistema de LRC).

5. Registrar respuesta de los usuarios a los eventos publicitados mediante envío de notificación.

6. Permitir a los creadores de eventos consultar cantidad de asistentes confirmados.

7. Permitir a los creadores de eventos cancelar eventos creados previamente.

# **Detalles de la plataforma**

## Generalidades

El sistema de la LRC se basará en un aplicativo Web apto para todos los dispositivos (PC, tablet, celulares, etc.).  
El ingreso al sistema será a través de un landing que mostrará un video sobre LRC (VID\_proximamente.mp4). Mientras se cargue el video se mostrará una imagen (IMG\_logo-LRC.png).  
El landing contará con una sección inferior (debajo del video principal) que permitirá el registro dentro de la plataforma.  
El landing contará con un botón en la parte superior derecha (login) que permitirá ingresar a la plataforma para acceder a todas las características dentro de ella.

## Registro

El registro en la plataforma se realizará a través de un formulario donde se solicitarán los siguientes datos:

- Nombre (obligatorio)  
- Apellido (obligatorio)  
- Email (obligatorio) \-\> será el usuario con el que ingresará al sistema a futuro  
- Contraseña  
  Confirmar contraseña  
- Número de celular  
- Código postal

Una vez registrado, el sistema enviará un email a la dirección consignada en el formulario con un link para confirmar que el mismo no es ficticio ni erróneo. El usuario deberá ingresar a su correo electrónico e ingresar al link enviado (se enviará como hipervínculo) para confirmar el email y así poder acceder a la cuenta dentro de LRC.

Si el usuario desea ingresar a la plataforma con el email y contraseña consignados en el formulario de registro antes de confirmar el correo mediante el link enviado, el sistema no permitirá el ingreso y notificará al usuario que debe confirmar la dirección previamente. Si ésta situación se realiza luego de 24hs generado el registro del usuario (y no habiendo confirmado el correo electrónico), se tomará como un usuario no registrado y se informará que el mismo no se encuentra registrado en el sistema.

## Uso de la plataforma (generalidades)

Los usuarios que se encuentren logueados en LRC, tendrán la posibilidad de ver un menú con las diferentes opciones disponibles.

Los usuarios logueados podrán:

- Crear eventos  
- Ver eventos próximos  
- Buscar eventos próximos por diferentes filtros (fecha, tipo, lugar, etc)  
- Confirmar asistencia a evento  
- Cancelar asistencia a evento previamente confirmada  
- Modificar datos personales  
- Agregar información de interés para visualizar eventos compatibles

El menú se visualizará como un ícono en la parte superior izquierda de la pantalla (el ícono variará según la plataforma donde se visualice).

El menú mostrará las opciones de:

- Buscar evento  
- Crear evento  
- Eventos a los que asistiré  
- Eventos creados por mí

## Uso de la plataforma (asistentes)

Los usuarios que se encuentren logueados en LRC, tendrán la posibilidad de ver la lista de eventos próximos ordenados de forma que en la parte superior de la grilla se vean los más cercanos a realizarse.

La visualización de la grilla de eventos se visualizará en una grilla similar a los estilos de NETFLIX. En la tarjeta del evento de verá la siguiente información:

- Tipo de evento  
- El nombre del evento  
- Nombre del lugar  
- Artista principal/destacado  
- Dirección (Calle, número y partido)  
- Horario de inicio  
- Cupo disponible (Hay lugar/Agotado)

Al presionar sobre la tarjeta de un evento, se visualizará el detalle del mismo con la siguiente información:

- Tipo de evento  
- El nombre del evento  
- Nombre del lugar  
- Artistas participantes  
  - Horario de inicio  
  - Horario de  finalización  
- Dirección (Calle, número y partido)  
- Horario de inicio  
- Horario de finalización  
- Lugares disponibles  
- Categoría (si aplica)  
- Botón de confirmar asistencia  
- Botón de cancelar asistencia (disponible hasta X tiempo antes del evento según información del evento creado)

## Uso de la plataforma (creadores)

Los usuarios que se encuentren logueados en LRC, tendrán la posibilidad de crear eventos.

Los usuarios que se encuentren logueados en LRC, tendrán la posibilidad de visualizar una lista de eventos creados por ellos mismos y los detalles de cada uno.

Los usuarios que se encuentren logueados en LRC, tendrán la posibilidad de cancelar eventos creados por ellos mismos.

Mediante la opción correspondiente del menú (Crear evento), se habilitará un formulario donde se disponibilizarán los siguientes campos a completar vinculados al evento en cuestión:

- Tipo de evento (desplegable con los diferentes tipos): Musical, Deportivo, Plástico, etc. El desplegable contará con un ABM (Campo obligatorio)  
- Nombre del evento (Campo obligatorio)  
- Nombre del lugar.  
- Artistas participantes (se habilitará uno y se permitirá agregar más a demanda mediante un botón \+). (Campo obligatorio para evento de tipo Musical)  
  - Horario de inicio (Campo obligatorio)  
  - Horario de  finalización (Campo obligatorio)  
- Dirección (Campo obligatorio)  
  - Calle (Campo obligatorio)  
  - Número (Campo obligatorio)  
  - Depto  
  - Partido (Campo obligatorio)  
- Horario de inicio. Campo obligatorio  
- Horario de finalización. Campo obligatorio  
- Capacidad máxima.  
- Categoría. Para evento deportivo solamente.  
- Posibilidad de cancelar asistencia. En caso de habilitarse, se informará la cantidad de horas previas hasta cuando puede realizarse.

Mediante la opción correspondiente del menú (Eventos creados por mí), el usuario podrá visualizar una lista de los eventos que ha creado. Ingresando a cada uno de ellos (haciendo click sobre la fila o tarjeta del evento) tendrá la posibilidad de cancelar el evento. Esta acción generará un envío masivo al email de todos los asistentes confirmados sobre la cancelación del evento.

Mediante la opción correspondiente del menú (Eventos creados por mí), el usuario podrá visualizar una lista de los eventos que ha creado. Ingresando a cada uno de ellos (haciendo click sobre la fila o tarjeta del evento) tendrá la posibilidad de realizar un envío masivo de confirmación de solicitud de asistencia al evento en cuestión. El envío se realizará al email de los usuarios registrados en LRC que:

- hayan indicado dentro de sus intereses, eventos del mismo tipo del evento a publicitar  
- hayan asistido previamente a eventos del mismo tipo del evento a publicitar  
- el código postal del evento coincida con el ingresado por el usuario en sus datos personales

## Sistema

El sistema se montará sobre la plataforma Vercel.

Se utilizará una base de datos en la nube como Supabase/Neon.

Se utilizará una paleta de colores **Amber Obsidian Autumn.**

Diseño **Mobile-First** con **Tailwind CSS.**

Tecnología: Node.js, Shadcn/ui o NextUI.

La plataforma tendrá un Frontend con la paleta de colores informados y estructura visual estilo NETFLIX. El Backend permitirá comunicarse a la base de datos, proveer la información a los usuarios, recibir las confirmaciones de email, etc. y también estará montado sobre Vercel.

