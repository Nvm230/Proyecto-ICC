# 🏢 SmartCondo — Sistema Inteligente de Gestión y Seguridad para Condominios

> Plataforma de monitoreo en tiempo real, gestión de usuarios y control de infracciones para condominios modernos. Construida con una arquitectura de microservicios sobre Docker.

---

## 📸 Vista General

El sistema integra sensores IoT simulados, procesamiento de eventos en tiempo real mediante MQTT y WebSockets, y un dashboard interactivo con control de acceso por roles.

---

## ✨ Funcionalidades Principales

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación JWT** | Login seguro con tokens, control de sesión persistente |
| 🎭 **Control de Roles** | Vistas diferenciadas para `ADMIN`, `SEGURIDAD` y `RESIDENTE` |
| ⚡ **Alertas en Tiempo Real** | Pipeline MQTT → Spring Integration → WebSocket → Dashboard |
| ⚠️ **Gestión de Infracciones** | Creación manual de multas, asignación por residente, resolución |
| 👥 **Gestión de Usuarios** | Listado de residentes, guardias y administradores |
| 📧 **Notificaciones por Email** | Envío automático de correos ante eventos críticos (SMTP) |
| 📄 **Paginación** | En todas las tablas y grillas del sistema |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Gateway)  :80                 │
│         Proxy inverso + balanceo de rutas               │
└──────┬──────────┬────────────────┬───────────────┬──────┘
       │          │                │               │
   /api/auth  /api/monitor      /ws/**          / (React)
       │          │                │               │
  ┌────▼────┐ ┌───▼──────────────┐ │        ┌─────▼─────┐
  │  Auth   │ │ Monitoring       │ │        │ Frontend  │
  │ Service │ │ Service          │ │        │  (Vite +  │
  │ :8080   │ │ :8081            │ │        │  React)   │
  └────┬────┘ └───┬──────────────┘ │        └───────────┘
       │          │   WebSocket    │
  ┌────▼──────────▼────────────────▼───┐
  │          Infraestructura           │
  │  PostgreSQL  │  Mosquitto MQTT     │
  │  :5432       │  :1883 / :9001      │
  └────────────────────────────────────┘
       ▲
  ┌────┴──────────────────┐
  │  Simuladores IoT      │
  │  Python (visión)      │
  │  Node.js (sensores)   │
  └───────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Java 21** + **Spring Boot 3.4** (REST APIs)
- **Spring Security** + **JWT** (autenticación)
- **Spring Data JPA** + **PostgreSQL** (persistencia)
- **Spring Integration MQTT** (pipeline de eventos IoT)
- **Spring WebSocket + STOMP** (tiempo real hacia el frontend)
- **Spring Mail** (notificaciones por email)

### Frontend
- **React 18** + **TypeScript** (Vite)
- **Tailwind CSS v4** (estilos)
- **Framer Motion** (animaciones)
- **Zustand** (estado global)
- **SockJS + @stomp/stompjs** (WebSocket)
- **React Hot Toast** (notificaciones)

### Infraestructura
- **Docker** + **Docker Compose** (orquestación)
- **Nginx** (API Gateway + proxy inverso)
- **Eclipse Mosquitto** (broker MQTT)
- **PostgreSQL 15** (base de datos)

### Simuladores
- **Python 3.12** (`paho-mqtt`) — simula eventos de cámaras/visión
- **Node.js 20** — simula sensores físicos (PIR, HC-SR04, Reed Switch)

---

## 📦 Estructura del Proyecto

```
condominio-smart-system/
├── backend/
│   ├── auth-service/          # Autenticación, registro, JWT
│   ├── monitoring-service/    # Procesamiento MQTT, WebSocket, Violations
│   └── notification-service/  # Envío de correos SMTP
├── frontend/                  # App React (Vite + Tailwind v4)
├── iot/                       # Simulador de sensores (Node.js)
├── vision-service/            # Simulador de cámaras (Python)
├── nginx/
│   └── nginx.conf             # Configuración del API Gateway
├── db-init/                   # Scripts SQL de inicialización
└── docker-compose.yml
```

---

## 🚀 Cómo Ejecutar Localmente

### Prerrequisitos
- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/condominio-smart-system.git
cd condominio-smart-system
```

### 2. Levantar el stack completo

```bash
docker compose up --build -d
```

El primer `--build` puede tardar **3–5 minutos** ya que descarga las imágenes base y compila los servicios Java con Maven.

### 3. Crear los usuarios de prueba

Una vez que los contenedores estén corriendo, ejecuta:

```bash
docker exec postgres-db psql -U admin -d condominio_db -c "
INSERT INTO users (username, password, role) VALUES
  ('admin',      crypt('admin123',      gen_salt('bf', 10)), 'ADMIN'),
  ('residente1', crypt('residente123',  gen_salt('bf', 10)), 'RESIDENTE'),
  ('guardia1',   crypt('guardia123',    gen_salt('bf', 10)), 'SEGURIDAD')
ON CONFLICT (username) DO NOTHING;
"
```

### 4. Abrir en el navegador

```
http://localhost
```

### 5. Detener el stack

```bash
docker compose down
```

> ⚠️ Usa `docker compose down -v` solo si quieres **borrar la base de datos** también.

---

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `residente1` | `residente123` | RESIDENTE |
| `guardia1` | `guardia123` | SEGURIDAD |

---

## 🎭 Control de Acceso por Rol

| Vista | ADMIN | SEGURIDAD | RESIDENTE |
|---|:---:|:---:|:---:|
| Alertas en Vivo | ✅ | ✅ | ❌ |
| Infracciones (todas) | ✅ | ✅ | ❌ |
| Mis Infracciones | — | — | ✅ |
| Gestión de Usuarios | ✅ | ✅ | ❌ |
| Configuración | ✅ | ✅ | ✅ |
| Crear Infracciones | ✅ | ✅ | ❌ |
| Resolver Alertas | ✅ | ✅ | ❌ |

---

## ⚙️ Variables de Entorno

Para configurar el servicio de correo (notificaciones), edita las siguientes variables en `docker-compose.yml` bajo el servicio `notification-service`:

```yaml
environment:
  SPRING_MAIL_HOST: smtp.gmail.com
  SPRING_MAIL_PORT: 587
  SPRING_MAIL_USERNAME: tu-correo@gmail.com
  SPRING_MAIL_PASSWORD: tu-app-password
```

> Para Gmail, genera una **App Password** desde [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

---

## 🔌 Endpoints API Principales

### Auth Service (`/api/auth`)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/login` | Autenticar usuario, devuelve JWT |
| `POST` | `/register` | Registrar nuevo usuario |
| `GET` | `/users` | Listar todos los usuarios |

### Monitoring Service (`/api/monitor`)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/violations` | Obtener todas las infracciones |
| `GET` | `/violations/user/{username}` | Infracciones de un residente |
| `POST` | `/violations` | Crear infracción manual |
| `PATCH` | `/violations/{id}/resolve` | Resolver una alerta |

### WebSocket
| Canal | Descripción |
|---|---|
| `ws://localhost/ws/alerts` | Conexión SockJS para tiempo real |
| `/topic/alerts` | Suscripción STOMP para recibir alertas |

---

## 📡 Simuladores IoT

El sistema incluye dos simuladores que publican eventos automáticamente al broker MQTT cada ~15–30 segundos:

- **`vision-service/`** (Python): Simula detecciones de cámaras (`PET_RESTRICTED_AREA`, `UNAUTHORIZED_VEHICLE`)
- **`iot/`** (Node.js): Simula sensores físicos (`PIR_LOBBY`, `HCSR04_GATE`, `REED_DOOR`)

> Las cámaras y sensores reales se integrarán en fases posteriores del proyecto.

---

## 📋 Notas de Desarrollo

- El frontend usa **Tailwind CSS v4** — evita la sintaxis `@apply` con utilidades de borde como `border-border`.
- Los servicios Java usan `spring-boot-starter-web` (no `webmvc`). Incluye Jackson y Tomcat correctamente.
- Para reconstruir solo el frontend: `docker compose build frontend && docker compose up -d`
- Para ver logs en vivo: `docker compose logs -f monitoring-service`

---

## 📄 Licencia

Este proyecto fue desarrollado como trabajo académico para el curso de **Ingeniería de Computación y Comunicaciones (ICC)** — UTEC.

---

*Desarrollado con ❤️ usando microservicios, tiempo real y buenas prácticas de ingeniería de software.*
