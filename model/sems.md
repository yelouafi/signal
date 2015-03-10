this page presents the semantics of the library; for the purists, please note this is not a rigorous formal definition in the spirit of the denotational method. If you spot an abstraction leak, or an ambiguous/incorrect definition, please let me know  (you can use the issue page or email me directly).

Semantics of functions are written in pseudo Haskell code (`F: X -> Y -> Z` means `F` is a function that take 2 arguments of `X` and `Y` and returns a result of type `Z`. But it can as well means `F` is a function that take one argument of type `X` and produce another function of type `X -> Z`).

Domains
========

###Value 
V : all values of meaning to the program 
	
###Function
*F: [V] -> V*  
A function over program values

###Neant
NA: null equivalent for signals

###Signal Value
*SV = V || NA*  
Signals can either have a Value or Neant
	
###Time
T : An ordered domain *(t<sub>0</sub>, t<sub>1</sub>, ..., t<sub>2</sub>)*  
Values of T forms the `program clock`

###Signal
*S: T -> SV*  
a set of `SV` values that a signal take over time `T`. 
Signals are discrete if at any time *t<sub>i</sub> => S = (ti, NA)*  
	
------------------


Operations
==========

there are 2 types of operations:

1. Event operators: Those who can act on the program clock (merge, filter)
2. Signal function: Those who act on the signal values

1- Event operators
---------------------

##.merge()
*merge: [S] -> S*  
*merge( [s<sub>i</sub>], t<sub>m</sub> ) =*

- *first s<sub>i</sub>( t<sub>m</sub> ) != NA ) || NA*

##.filter()  
*filter: S -> F -> S*  
*filter (s, f, t<sub>i</sub> ) =*

- *f( s( t<sub>i</sub>) ) != NA ...........=> s( t<sub>i</sub> )*  
- *else ...........................=> NA*

2- Signal functions
--------------------

##.map()
*map: F -> [S] -> S*  
*map (f, [s], t<sub>i</sub>) =*

- *all( [ s(t<sub>i</sub>) ] ) != NA ...........=> f( [ s(t<sub>i</sub>) ] )*
- *else ................................=> NA*

##.fold()
*fold: F -> V -> S -> S*  
*fold (f, v, s, t<sub>0</sub>, t<sub>i</sub>) =*

- *t<sub>i</sub> > t<sub>0</sub>...........=> f( fold( f, v, s, t<sub>0</sub>, t<sub>i-1</sub>), s(t<sub>i</sub>) )*
- *else.............=> v*


##.swtich()
*switch: S -> S<sub>S</sub> -> T-> S*  
*switch(s, ss, t<sub>0</sub>, t<sub>i</sub>) =*  
- *t<sub>i</sub> > t<sub>0</sub> .............=> *  
- *else .............=> s(t<sub>i</sub>)*