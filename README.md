# Filogenia Dashboard

Dashboard web interactivo para análisis y comparación de árboles filogenéticos generados mediante diferentes métodos de reconstrucción (Neighbor-Joining y Máxima Verosimilitud).

## Características

- **Carga de archivos FASTA**: Sube archivos FASTA con múltiples secuencias
- **Alineamiento múltiple**: Alineamiento progresivo automático de secuencias
- **Construcción de árboles**: Algoritmos Neighbor-Joining y Máxima Verosimilitud
- **Comparación visual**: Compara topologías entre diferentes métodos
- **Visualización D3.js**: Representación interactiva de árboles filogenéticos
- **Análisis estadístico**: Distancia Robinson-Foulds y métricas de similitud

## Arquitectura

### Backend (Flask + Biopython)
- **API REST** con endpoints para cada funcionalidad
- **Biopython** para procesamiento de secuencias y algoritmos filogenéticos
- **Gestión de sesiones** para múltiples análisis simultáneos
- **Validación de archivos** y manejo de errores

### Frontend (React + Vite + Tailwind CSS)
- **Interfaz moderna** y responsiva
- **Visualización D3.js** de árboles filogenéticos
- **Flujo guiado** paso a paso
- **Indicadores de progreso** y retroalimentación

## Instalación y Configuración

### Requisitos Previos
- Python 3.8+
- Node.js 16+
- Git

### Backend

1. **Clonar repositorio y navegar al directorio del proyecto**
```bash
cd filogenia_dashboard
```

2. **Crear y activar entorno virtual**
```bash
python -m venv env

# En Windows
.\env\Scripts\Activate.ps1

# En Linux/Mac
source env/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Ejecutar el servidor**
```bash
python run.py

# O también
flask run
```

El backend estará disponible en `http://localhost:5000`

### Frontend

1. **Navegar al directorio frontend**
```bash
cd frontend
```

2. **Instalar dependencias**
```bash
# nodejs
npm install
# bun
bun install
```


3. **Ejecutar el servidor de desarrollo**
```bash
# nodejs
npm run dev
# bun
bun run dev
```

El frontend estará disponible en `http://localhost:5173`

## Uso de la Aplicación

### 1. Subir archivo FASTA
- Selecciona un archivo FASTA con múltiples secuencias (mínimo 3)
- Formatos soportados: `.fasta`, `.fas`, `.fa`
- Tamaño máximo: 16MB

### 2. Revisar secuencias
- Verifica las secuencias identificadas
- Confirma que son del mismo tipo (ADN, ARN o proteínas)

### 3. Realizar alineamiento
- Ejecuta el alineamiento múltiple automático
- Revisa la vista previa del alineamiento

### 4. Construir árboles
- Construye árboles con diferentes métodos:
  - **Neighbor-Joining**: Rápido, basado en distancias
  - **Máxima Verosimilitud**: Más preciso, basado en probabilidades

### 5. Comparar árboles
- Compara las topologías entre métodos
- Analiza métricas de similitud y diferencias
- Interpreta los resultados

## Estructura del Proyecto

```
filogenia_dashboard/
├── app/                          # Backend Flask
│   ├── __init__.py
│   ├── routes.py                 # Endpoints API
│   ├── multiple_aligner.py       # Alineamiento múltiple
│   ├── tree_builder.py           # Construcción NJ
│   ├── ml_tree.py                # Construcción ML
│   ├── tree_comparator.py        # Comparación de árboles
│   ├── uploads/                  # Archivos subidos
│   └── results/                  # Resultados generados
├── frontend/                     # Frontend React
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   ├── services/             # Servicios API
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── requirements.txt              # Dependencias Python
├── run.py                        # Punto de entrada
└── README.md
```

## API Endpoints

- `POST /api/upload_fasta` - Subir archivo FASTA
- `POST /api/align/<session_id>` - Realizar alineamiento
- `POST /api/build_tree/<session_id>/<method>` - Construir árbol
- `POST /api/compare_trees/<session_id>` - Comparar árboles
- `GET /api/get_tree/<session_id>/<method>` - Obtener árbol
- `GET /api/session/<session_id>` - Info de sesión
- `GET /api/health` - Estado del servidor

## Tecnologías Utilizadas

### Backend
- **Flask**: Framework web
- **Biopython**: Procesamiento de secuencias biológicas
- **NumPy/SciPy**: Cálculos numéricos
- **Flask-CORS**: Soporte para CORS

### Frontend
- **React 19**: Biblioteca para creación de UI
- **Vite**: Herramienta de construcción rápida
- **Tailwind CSS**: Framework de estilos
- **D3.js**: Visualización de datos
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos

## Limitaciones Actuales

1. **Algoritmo ML**: Implementación simplificada (usa NJ optimizado)
2. **Escalabilidad**: Diseñado para archivos de tamaño moderado
3. **Almacenamiento**: Sesiones en memoria (se pierden al reiniciar)
4. **Modelos evolutivos**: Solo modelo de identidad para distancias

## Desarrollo Futuro

- Implementación completa de algoritmos ML (RAxML, IQ-TREE)
- Soporte para múltiples modelos evolutivos
- Persistencia de sesiones en base de datos
- Visualización de alineamientos múltiples
- Análisis de bootstrap real
- Exportación de resultados

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NewFeature`)
3. Commit tus cambios (`git commit -m 'Add some NewFeature'`)
4. Push a la rama (`git push origin feature/NewFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

## Soporte

Para reportar problemas o solicitar funcionalidades, por favor abre un issue en GitHub.
