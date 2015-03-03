
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
a set of signal values `SV` that a signal take over time `T`.  
Signals are discrete if for any time *t<sub>i</sub> => S = (ti, NA)*  
example: *[ (t<sub>0</sub>, v<sub>0</sub>), ..., (t<sub>k</sub>, NA), ..., (t<sub>n</sub>, v<sub>m</sub>) ]*

###Stateful Signal
*SS: T -> V*  
Stateful signals can not have a `NA` value at any point in time
	
------------------


Operations
==========

there are 2 types of operations:

1. Event operators: Those who can act on the program clock (merge, filter)
2. Signal function: Those who act on the signal values

1- Event operators
---------------------

##.merge()
*merge: [S] -> T -> SV*  
*merge( [s<sub>i</sub>], t ) = first( s<sub>i</sub>(t) != NA ) or NA*

##.filter()
*filter: S -> F -> T -> SV*  
*filter (s, f, t ) = *

- *f( s(t) ) != NA => s(t)*  
- *else => NA*

2- Signal functions
--------------------

##.keep()

*keep: S -> V -> T -> V*  
*keep(s, v, t<sub>i</sub>) = *  

- *(t<sub>i</sub> == t<sub>0</sub>) => v*
- *s(t<sub>i</sub>) != NA =>	s(t<sub>i</sub>)*  
- *else =>	s(t<sub>i-1</sub>)*


##.map()
*map: F -> [S] -> T -> V*  
*map (f, [s], t) =*

- *all([s(t)]) != NA => f.apply( [s(t)] )*
- *else => NA*

##.fold()
*fold: F -> V -> S -> T -> V* 
*fold (f, v, s, t<sub>i</sub>) =*

- *t == t0    => v*
- *else         => f( v, s(t<sub>i-1</sub>) )*

##.swtich()
*switch: S -> T -> V*  
*switch(s, t) = s(t)(t)*
