# Clase 5

# Modelo optimista

**Enfoque:** Estos métodos asumen que no ocurrirá un comportamiento no serializable y actúan para reparar el problema sólo cuando ocurre una violación aparente.

# Timestamping

**Timestamp:(TS(T))** **Número de marca** asignado de forma ascendente y único para cada transacción. El scheduler tiene una tabla de transacciones y sus _timestamps_. El scheduler mantiene una **tabla** con las transacciones y sus timestamps; este también maneja la ejecución concurrente de manera que los timestamps determinan el **orden de serialización**.

Cada elemento (ítem de la base de datos en una celda) X se asocia a 2 timestamps y un bit extra:

- **RT(X):** (Read-Timestamp) Tiempo de lectura, el timestamp **más alto** de una transacción que **haya leído X**. 

- **WT(X):** (Write-Timestamp) Tiempo de escritura, el timestamp **más alto** de una transacción que **ha escrito X**.

- **C(x):** (Commit) Bit de commit para X, es verdadero sii la transacción más **reciente** que **escribió X ha realizado un commit**.

**Fisicamente irrealizable:** Cuando no se puede mantener la ilusión de que todo ocurrió en el orden de los timestamps el comportamiento se llama asi. O sea, que puede suceder que:

  - **Read Too Late:** (T comienza ; W escribe X ; T lee X -> T debe abortar si TS(T) < TS(W)) 
    - TS(T) < WT(X)
    - Una transacción T intenta leer X pero el valor de escritura indica que X fue escrito después de que teóricamente debería haberlo leído T.
    
  - **Write Too Late:** (T comienza ; W lee X ; T escribe X -> T debe abortar si TS(T) < TS(W)) 
    - WT(X) < TS(T) < RT(X)
    - T intenta escribir pero el tiempo de lectura de X indica que alguna otra transacción debería haber leído el valor escrito por T (lee otro valor en su lugar).

**Dirty data:** Una lectura sucia ocurre cuando se le permite a una transacción la **lectura** de un elemento que ha sido **modificado** por otra transacción concurrente pero que todavía **no ha sido cometida** (commit).

**Thomas write rule:** La escritura puede “saltearse” cuando ya existe una escritura de una transacción con un timestamp de mayor valor. Es decir cuando WT(X) > TS(T).   
Si se aborta la escritura con mayor TS, entonces se efectiviza la escritura que se había intentado. Para hacer esto, como C(X) se pone en falso al momento en que se escribió porque no se commiteó y también el scheduler hace una copia de los valores de X y de WT(X) previos.

## Opciones para el scheduler ante una solicitud de T:

- Conceder la solicitud.
- Abortar y reiniciar T con un nuevo timestamp (rollback).
- Demorar T y decidir luego si abortar o conceder la solicitud (si el requerimiento es una lectura que podría ser sucia).

### Recibe una solicitud de lectura r<sub>t</sub>(X)

**Caso 1:** Si TS(T) >= WT(X) - es físicamente realizable (**no sucede read too late**).

- Si **C(X) es True**, conceder la solicitud. Si TS(T)>RT(X) hacer RT(X)=TS(T), de otro modo no cambiar RT(X).
- Si **C(X) es False**, demorar T hasta que C(X) sea verdadero o la transacción que escribió a X aborte.

**Caso 2:** Si TS(T) < WT(X) - es físicamente irrealizable (**read too late**).

- Se hace Rollback T (abortar y reiniciar con un nuevo timestamp).

### Recibe una solicitud de escritura w<sub>t</sub>(X)

**Caso 1:** Si TS(T) >= RT(X) y TS(T) >= WT(X) - es físicamente realizable, es decir, **no sucede write too late**.

- Escribir el nuevo valor para X.
- WT(X) := TS(T), o sea asignar nuevo WT a X.
- C(X):= false, o sea poner en falso el bit de commit.

**Caso 2:** Si TS(T) >= RT(X) pero TS(T) < WT(X) - es físicamente realizable, pero ya hay un valor posterior en X.

- Si C(X) es true, ignora la escritura.
- Si C(X) es falso **demorar T** (se frena completamente la transacción) hasta que C(X) sea verdadero o la transacción que escribió a X aborte.

**Caso 3:** Si TS(T) < RT(X) - es físicamente irrealizable, es decir, write too
late.

- Se hace Rollback T (abortar y reiniciar con un nuevo timestamp).

### Recibe un commit de T (C(T))
Para cada uno de los elementos X escritos por T se hace:  
  - C(X) := true.
  - Se permite proseguir a las transacciones que esperan a que X sea committed.

### Recibe un abort/rollback de T (A(T) ó R(T))

Cada transacción que estaba esperando por un elemento X que T escribió debe repetir el intento de lectura o escritura y verificar si ahora el intento es legal.

# Timestamping multiversión

- Variación/Extensión del schedulers monoversión
- Mantiene versiones históricas de los items (las versiones son transparentes para la aplicación y transitorias (es decir, sujetas a recolección de basura))
- Permite que las transacciones lean valores antiguos
- Evita aborts ocasionados por eventos read-too-late

**Lectura y escritura:** Una operación de lectura de la forma r(x) **lee una versión** existente de x (la cual podría elegir), y una operación de escritura de la forma w(x) (siempre) **crea una nueva versión** de x o sobrescribe una existente.  

Asumimos que cada transacción escribe cada elemento de datos como máximo una vez; por lo tanto, si t<sub>j</sub> contiene la operación w<sub>j</sub>(x), podemos denotar la versión de x creada por esta escritura como x<sub>j</sub> .

**Función de versión:** Sea s una historia, una función de versión de s es una función h (h: op -> op) que:

  - Asocia cada operación de lectura con una operación de escritura anterior del mismo ítem.
  - Para operaciones de escritura es la identidad.

**Historia multiversión:** 
  - Toda operación en la historia pertenece al conjunto de operaciones de la historia con h aplicada.
  - El orden de cada operación en una transacción se debe respetar en la historia.
  - Si a una operación l se le aplica h y retorna q (donde l y q no pertenecen a la misma transacción), entonces la transacción a la que pertenece q debe haber commiteado antes que la transacción de l.

**Schedule multiversión:** Un **prefijo** de una historia multiversión.  
Un planificador multiversión es un **planificador monoversión** si su función de versión asigna cada lectura a la **última escritura precedente** en el mismo elemento de datos.

**Reads-from relation: (RF(m))** (t<sub>j</sub>, x, t<sub>i</sub>) La transacción t<sub>j</sub> lee de la transacción t<sub>i</sub> el ítem x.  
Sean m y m' dos schedules multiversión tal que el conjunto de transacciones es el mismo, entonces m y m' son **view equivalentes** si RF(m) = RF(m').

**Multiversión view serializable:** Sea m una historia multiversión, se dice que m es multiversión view serializable si **existe una historia m' serial monoversión tal que m =<sub>v</sub> m'**. La clase de hitorias que cumplen se la refiere como **MVSR**. Determinar pertenencia en esta clase es NP-completo.

**Grafo de conflictos - RF: G(m)** Se construye con nodos por cada transacción de m con un eje t<sub>i </sub> -> t<sub>j</sub> si r<sub>j</sub> (x<sub>i </sub> ) esta en m.  
Para cualquier par de schedulers multiversión, m =<sub>v</sub> m' **entonces** G(m) = G(m') (la vuelta puede no valer).

**Orden de versiones: (<<<sub>x</sub>)** Un orden de versiones para un ítem de datos x es un orden total entre todas las versiones de x.  
Un orden de versiones para un plan multiversión m es la unión de los órdenes de versiones para todos los ítems escritos en m.

**Grafo de serialización multiversión: (MVSG(m))** Dado un plan m y un orden de versiones <<, el Grafo de Serialización Multiversión, MVSG (m, <<), es un grafo dirigido donde:
  - Los **nodos son las transacciones** en m.
  - Las **aristas** se definen por las **reglas de conflicto y de orden de versiones**, contiene:
    - Todas las aristas del grafo de conflictos G(m),
    - Para r<sub>k</sub>(x<sub>j</sub>), w<sub>i</sub>(x<sub>i</sub>) ∈ op(m): Si x<sub>i</sub> << x<sub>j</sub>, entonces agregar arista t<sub>i</sub> -> t<sub>k</sub>. O sea, si la versión de x que lee la transacción k es más nueva que la operación en i que escribió x entonces la transacción que creó la versión x<sub>i</sub> se conecta con la que lee la versión x<sub>j</sub>.
    - Para r<sub>k</sub>(x<sub>j</sub>), w<sub>i</sub>(x<sub>i</sub>) ∈ op(m): Si x<sub>j</sub> << x<sub>i</sub>, entonces agregar arista t<sub>k</sub> -> t<sub>i</sub> .

La idea principal de esto es que el MVSG extiende el grafo de conflictos incorporando
dependencias de orden de versiones.  
Un historial multiversión m pertenece a MVSR (Multiversion Serializability) si y solo si existe un orden de versiones << tal que el MVSG (m, <<) sea **acíclico**.

**Multiversión conflicto serializable (MCSR):** Un conflicto multiversión en un schedule multiversión m es un par de pasos r<sub>i</sub>(x<sub>j</sub>) y w<sub>k</sub>(x<sub>k</sub>) tales que r<sub>i</sub>(x<sub>j</sub>) <<sub>n</sub>  w<sub>k</sub>(x<sub>k</sub>). Es una subclase de MVSR cuya pertenencia puede determinarse en P.

  - El único tipo relevante de conflictos son los pares de operaciones read-write en el mismo ítem de datos, no necesariamente en la misma versión.
  - Los pares write-write en el mismo ítem de datos ya no se consideran conflictos, ya que crean  versiones diferentes y depende de las operaciones de lectura elegir la versión adecuada
  - **Los write-read no siempre son conflictos, pero si la lectura depende de una escritura (o de que la escritura aún no ocurrió), entonces sí se convierten en conflictos porque no se pueden intercambiar los órdenes de ejecución sin cambiar el resultado.** -> No entiendo esto

**Pasos de transformación:** **Un paso de transformación intercambia el orden de dos pasos adyacentes (es decir, pasos p, q con p \< q tal que o \< p y q \< o para todos los demás pasos o) pero sin invertir el orden de un par de conflicto multiversión (es decir, rw ).** -\> Que es un paso?

**Reducibilidad multiversión:** Una historia multiversión es multiversión reducible si puede transformarse en una historia serial monoversión mediante una secuencia de pasos de transformación.
