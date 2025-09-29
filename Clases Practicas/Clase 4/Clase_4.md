# Clase 4

Vamos a ver el **paradigma pesimista** que es un paradigma para el control de concurrencia en bases de datos (es pesimista u optimista _(clase 5)_ según cómo manejan los conflictos de accesos a datos).

**Enfoque** del modelo pesimista: Asume que los conflictos de datos son probables y que las transacciones bloquearán los datos que leen o escriben.

## Serializabilidad

**Transacciones:** Conjunto de operaciones (reads, writes y luego puede llegar a terminar con un commit o abort) con un orden.

**Schedule:(Plan)** Orden parcial de las operaciones de las transacciones que muestra como las transacciones son intercaladas. Las operaciones de las transacciones deben estar en el mismo orden en el schedule. Es el prefijo de una historia.

**History:(Historia)** Resultado de cada transacción ya es conocido, contiene todas las operaciones, incluida la terminación.

**Operaciones Conflictivas:** Si dos operaciones operan sobre el mismo ítem y al menos una de ellas es escritura.

**Equivalencia:** Dos historias son conflicto equivalentes si estan definidas sobre el mismo conjunto de transacciones y el orden de las operaciones conflictivas de transacciones no abortadas es el mismo (o sea si w_1(X) < r_2(X) en una, en la otra tambien).

**Historia serial:** Es una secuencia de transacciones.

**Conflicto serializable:(SR)** Una histora es conflicto **serializable** si es conflicto equivalente a alguna historia serial.

**Grafo de precedencia:** Se utiliza el grafo de precedencia **SG(H)**. Es un grafo dirigido con las siguientes características:
- Un nodo para cada transacción Ti ⊆ H.

- Hay ejes entre Ti y Tj sí y sólo sí hay una operación de Ti que precede en H a una operación de Tj y son operaciones conflictivas.

- Etiquetamos los ejes del grafo con los nombres de los ítems que los generan

**Teorema de seriabilidad:** Una historia H es SR sii SG(H) es acíclico.

**Equivalencia serial:** Si SG(H) es acíclico entonces los órdenes seriales equivalentes son los diferentes ordenes topológicos del grafo.

**Order preserving conflict serializability:** Una historia s se llama **OCSR** si:

- Es **conflicto-serializable**, es decir, existe una historia serial s' si las operaciones de son las mismas y son conflicto equivalentes.

- Para todas las transacciones t, t′ ∈ trans(s): si t ocurre completamente antes que t′ en s, entonces lo mismo ocurre en s′ (o sea, si t commitea/aborta antes que t' en s entonces en s' también).

Denotamos por **OCSR** la clase de todas las historias conflicto-serializables que preservan el orden.

## Recuperabilidad

**Recuperación:** Se puede asumir que el Abort se implementa recuperando imágenes anteriores de los ítems.

**Lost-Update:** Pierde la actualización de un dato pq una transacción lo modifica y antes de escribirlo se modifica ese dato por otra transacción.

**Inconsistent-Read:** Una transacción mezcla distintos valores diferentes de versiones distintas de la base de datos y termina con un estado imposible.

**Dirty-Read:** Usar cosas en una transacción que fueron "ensuciadas" por una transacción que fue abortada y los datos que modificó quedaron siendo que no son los verdaderos.

**Lectura entre transacciones:** Dadas T<sub>i</sub>, T<sub>j</sub> decimos que T<sub>i</sub> lee X de T<sub>j</sub> si T<sub>i</sub> lee X y T<sub>j</sub> fue la última transacción que escribió X y no abortó antes de que T<sub>i</sub> lo leyera.

**Historia Recuperable: (RC)** Una historia H es **RC** si siempre que una transacción T<sub>i</sub> lee de T<sub>j</sub> con i != j en H y c<sub>i</sub> ∈ H entonces c<sub>j</sub> < c<sub>i</sub>. \
Intuitivamente una historia es recuperable si una transacción **realiza commit sólo después de que hicieron commit todas las transacciones de las cuales lee**. Puede haber abortos en cascada todavía.

**Avoids Cascading Aborts: (ACA)** Una historia H es ACA si siempre que una transacción T<sub>i</sub> lee X de T<sub>j</sub> con i != j en H entonces c<sub>j</sub> < r<sub>i</sub>(X). Lee sólo valores de transacciones que ya hicieron _commit_.

**Stricta: (ST)** Una historia H es ST si siempre que w<sub>j</sub>(X) < o<sub>i</sub>(X) con i != j entonces aj < o<sub>i</sub>(X) o cj < o<sub>i</sub>(X) siendo o<sub>i</sub>(X) igual a r<sub>i</sub>(X) o a w<sub>i</sub>(X). \
Es decir no se puede leer ni escribir un ítem hasta que la transacción que lo escribió previamente haya hecho commit o abort.

**Teorema de recuperabilidad:** RG ⊂ ST ⊂ ACA ⊂ RC. (SR es ortogonal a todas estas). RG es un subconjunto propio de SR porque, por definición, en un schedule riguroso cada par de operaciones conflictivas está separado por el commit de la transacción que ejecutó primero. Esto implica que la historia serial conflicto-equivalente se obtiene siguiendo el mismo orden en que las transacciones realizan sus commits en el schedule.

**Schedule riguroso: (RG)** s es riguroso (RG) si es estricto (ST) y además satisface las siguiente condición de rigurosidad: ∀t<sub>i</sub>, t<sub>j</sub> ∈ trans(s), Si r<sub>j</sub>(x) <<sub>s</sub> w<sub>i</sub>(x), i != j entonces a<sub>j</sub> <<sub>s</sub> w<sub>i</sub>(x) ∨ c<sub>j</sub> <<sub>s</sub> w<sub>i</sub>(x).

**Propiedad de Prefijos Commit en Clases de Schedules:** Una propiedad que se puede verificar fácilmente usando las definiciones de RG, ST, ACA y RC es que la pertenencia a cualquiera de estas cuatro clases es **cerrada bajo prefijos commit** (o sea, que si tomamos un prefijo s' del schedule que pertenece a una de estas clases s y s'' solo tiene las transacciones commiteadas de s', s'' esta en la misma clase que s).   
O sea que:
  - Si un schedule pertenece, por ejemplo, a ACA, la misma propiedad se cumple para la **proyección de los commits**(schedule parcial sobre solamente las transacciones commiteadas hasta ese tramo) de cada uno de sus prefijos.
  - Esto permite analizar schedules de manera incremental, mientras las operaciones van llegando.
  - Facilita la verificación de consistencia y control de concurrencia en tiempo real.

## Control de concurrencia

**Lock:** Variable asociada con un ítem de datos que describe el estado de ese ítem con respecto a posibles operaciones que pueden aplicarse a él.

**Lock binario:** Solo pueden tener uno de dos estados: locked o unlocked. 
  - l<sub>i</sub>(A) Lock. La transacción i realiza un bloqueo o lock sobre el ítem A. 
  
  - u<sub>i</sub>(A) UnLock. La transacción i libera los bloqueos o locks previos sobre el ítem A. Usado en todos los modelos, se asume que libera todos los locks tomados.
  
  - El lock binario fuerza exclusión mutua sobre un ítem X. Las transacciones pueden ser vistas como una secuencia de locks y unlocks

**Consistencia de Transacciones:** (para binario)
  - Una T<sub>i</sub> puede leer o escribir un ítem X si previamente realizó un lock sobre X y no lo ha liberado
  - Si una transacción T<sub>i</sub> realiza un lock sobre un elemento debe posteriormente liberarlo.

**Legalidad:** (para binario)  
 Una T<sub>i</sub> que desea obtener un lock sobre X que ha sido lockeado por T<sub>j</sub> en un modo que conflictua, debe esperar hasta que T<sub>j</sub> haga unlock de X.

**Grafo de precedencia para lock binario:**
Se asume H legal. Para hacer el SG(H) se siguen lossiguientes pasos:
  - Hacer un nodo por cada T<sub>i</sub> ⊆ H
  - Si T<sub>i</sub> realiza un l<sub>i</sub>(X) para algún ítem X y luego T<sub>j</sub> con i != j realiza un
l<sub>i</sub>(X) hacer un arco T<sub>i</sub> → T<sub>j</sub>

**Lock ternario:** Debido a que operaciones de lectura de diferentes transacciones sobre el mismo ítem no son conflictivas se puede permitir que accedan sólo para lectura.
  - rl<sub>i</sub>(A) Lock de lectura o compartido. La transacción i realiza un bloqueo o lock de lectura sobre el ítem A.
  - wl<sub>i</sub>(A) Lock de escritura o exclusivo. La transacción i realiza un lock exclusivo o de escritura sobre el ítem A.

**Consistencia:** (para ternario)
  - Una accion r<sub>i</sub>(X) debe ser precedida por un rl<sub>i</sub>(X) o un wl<sub>i</sub>(X), sin que intervenga un u<sub>i</sub>(X)
  - Un accion w<sub>i</sub>(X) debe ser precedida por una wl<sub>i</sub>(X) sin que intervenga un u<sub>i</sub>(X)
  - Todos los locks deben ser seguidos de un unlock del mismo elemento.

**Legalidad:** (No haltea) (para ternario)
  - Si wl<sub>i</sub>(X) aparece en una historia, entonces no puede haber luego un wl<sub>j</sub>(X) o rl<sub>j</sub>(X) para j != i sin que haya primero un u<sub>i</sub>(X).
  - Si rl<sub>i</sub>(X) aparece en una historia no puede haber luego un wl<sub>j</sub>(X) para j != i sin que haya primero un u<sub>i</sub>(X).

**Conversión:** Una transacción que tiene un lock sobre un ítem X tiene permitido bajo ciertas condiciones convertir dicho lock en otro tipo de lock. La forma más común es el upgrading lock, es decir pasar de un lock de escritura o compartido a un lock exclusivo o de escritura.

**Update lock:** Un update lock sobre un ítem X que denotamos uli(X) da a la transacción Ti
privilegio de lectura sobre X pero no de escritura. Como ventaja el update lock pasa a ser el único que puede ser upgraded a write lock.

**Two Phase Locking:** Una transacción respeta el protocolo de bloqueo en dos fases (2PL) si todas las operaciones de bloqueo (lock) preceden a la primer operación de desbloqueo (unlock) en la transacción. Una  transacción que cumple con el protocolo se dice que es una **transacción 2PL**.
  
  - Fase de **crecimiento**: toma los locks
  - Fase de **contracción**: libera los locks

**Seriabilizabilidad con 2PL:** Dado T = T<sub>1</sub>, T<sub>2</sub>, ..., T<sub>n</sub>, si **toda T<sub>i</sub> en T es 2PL**, entonces todo H legal sobre T es SR. Es mas se cumple que también Gen(2PL) ⊂ OCSR.  
En una historia H puede pasar que se lea un ítem de una transacción que no hizo commit (o sea una historia puede ser 2PL y no ser ACA).

**Variantes de 2PL:**
  - **2PL Conservador (C2PL):** Bajo 2PL estático o conservador (C2PL), cada transacción adquiere todos los locks que necesitará al inicio, es decir, antes de ejecutar su primer paso de lectura (r) o escritura (w).Esto también se conoce como pre-reclamar todos los locks necesarios de antemano.
  - **2PL Estricto (2PLE o S2PL):** Una transacción cumple con 2PL Estricto si es 2PL y no libera ninguno de sus locks de escritura hasta después de realizar el commit o el abort. 2PLE garantiza que la historia es ST.
  - **2PL Riguroso (2PLR o SS2PL):** Una transacción cumple con 2PL Riguroso si es 2PL y no libera ninguno de sus locks de escritura o lectura hasta después de realizar el commit o el abort.

**Deadlock:** Deadlock es un estado en el cual cada miembro de un grupo de transacciones está esperando que algún otro miembro libere un lock. (Se tratan con **prevención** y **detección**)

**Wait-for graph:** 
  - Un nodo por cada transacción que tiene un lock o espera por uno.
  - Un eje entre dos nodos (T<sub>i</sub> y T<sub>j</sub>) si T<sub>i</sub> está esperando que T<sub>j</sub> libere un lock que sobre un ítem que T<sub>i</sub> necesita bloquear.

**Elección de la víctima en un wait-for graph:** Puede tener varios _criterios_
  - Cuanto tiempo la transacción ha estado ejecutándose. Sería mejor abortar una transacción más joven que una que ha estado ejecutándose por más tiempo 
  - Cuantos ítems de datos han sido actualizados por la transacción. Sería mejor abortar una transacción que hizo pocas modificaciones a la base de datos. Es decir que tiene la menor cantidad de registros de log.
  - Cuantos ítems de datos le faltan actualizar. Aunque esto puede ser algo que el DBMS no necesariamente sepa.
  - El número de ciclos que contiene la transacción. Mientras
  más ciclos tenga mejor es.

**Prevención usando TimeStamp:**  
Cada transacción T<sub>i</sub> recibe un timestamp **TS(T<sub>i</sub>)**. Es un
identificador único basado en el orden en el cual cada
transacción comienza. Si TS(T<sub>i</sub>) < TS(T<sub>j</sub>) significa que T<sub>i</sub> es más
vieja que T<sub>j</sub>.  
Si T<sub>i</sub> intenta realizar un lock sobre un ítem y no puede porque T<sub>j</sub> ya tiene un lock previo entonces hay dos estrategias:

  - **Wait-Die:**
    - Si TS(T<sub>i</sub>) < TS(T<sub>j</sub>) (T<sub>i</sub> más viejo que T<sub>j</sub>), entonces T<sub>i</sub> se lo pone en espera, 
    - Si TS(T<sub>i</sub>) > TS(T<sub>j</sub>)(T<sub>i</sub> más joven que T<sub>j</sub>), entonces se aborta T<sub>i</sub> (T<sub>i</sub> dies) y se recomienza mas tarde con el mismo timestamp.
  - **Wound-Wait:**
    - Si TS(T<sub>i</sub>) < TS(T<sub>j</sub>) (T<sub>i</sub> más viejo que T<sub>j</sub>), entonces, abortar T<sub>j</sub> (T<sub>i</sub> wounds T<sub>j</sub>) y recomienza más tarde con el mismo timestamp.
    - Si TS(T<sub>i</sub>) > TS(T<sub>j</sub>)(T<sub>i</sub> más joven que T<sub>j</sub>),entonces, T<sub>i</sub> se pone en espera.
  
**Otros esquemas:**
  - Timeout
  - No waiting (NW)
  - Cautious waiting (CW)
    - Cuando T<sub>i</sub> quiere bloquear un ítem que está bloqueado por T<sub>j</sub>: Si T<sub>j</sub> no está bloqueada (no esta esperando por algún otro ítem bloqueado) entonces T<sub>i</sub> es bloqueado y espera. En otro caso T<sub>i</sub> aborta.