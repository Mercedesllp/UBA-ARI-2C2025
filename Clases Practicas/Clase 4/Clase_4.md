# Clase 4

**Transacciones:** Conjunto de operaciones (reads, writes y luego puede llegar a terminar con un commit o abort) con un orden.

**Schedule:(Plan)** Orden parcial de las operaciones de las transacciones que muestra como las transacciones son intercaladas. Las operaciones de las transacciones deben estar en el mismo orden en el schedule. Es el prefijo de una historia.

**History:(Historia)** Resultado de cada transacción ya es conocido, contiene todas las operaciones, incluida la terminación.

**Operaciones Conflictivas:** Si dos operaciones operan sobre el mismo ítem y al menos una de ellas es escritura.

**Equivalencia:** Dos historias son conflicto equivalentes si estan definidas sobre el mismo conjunto de transacciones y el orden de las operaciones conflictivas de transacciones no abortadas es el mismo.

**Conflicto serializable:(CSR)** Una histora es conflicto **serializable(SR)** si es conflicto equivalente a alguna historia serial.

**Grafo de precedencia:** Se utiliza el grafo de precedencia SG(H). Es un grafo dirigido con las siguientes características:
- Un nodo para cada transacción Ti ⊆ H.

- Hay ejes entre Ti y Tj sí y sólo sí hay una operación de Ti que precede en H a una operación de Tj y son operaciones conflictivas.

- Etiquetamos los ejes del grafo con los nombres de los ítems que los generan

**Teorema de seriabilidad:** Una historia H es SR sii SG(H) es acíclico.

**Equivalencia serial:** Si SG(H) es acíclico entonces los órdenes seriales equivalentes son los diferentes ordenes topológicos del grafo.

**Order preserving conflict serializability:** Una historia s se llama **OCSR** si:

- Es **conflicto-serializable**, es decir, existe uns historia serial s' si las operaciones de son las mismas y son conflicto equivalentes.

- 