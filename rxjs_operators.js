import { fromEvent, of, pluck } from ('rxjs')
import { map} from ('rxjs/operators')

/****** CREATION OPERATORS  *********/

// Example 1. Emitting sequence of numbers
const sources = of(1, 2, 3, 4, 5) // Emits any number of provided values in sequence & then emits a complete notification
// Output: 1, 2, 3, 4, 5
const subscribe = sources.subscribe(val => console.log(val))
// console.log('subscribe:', subscribe);


// Turn event into observable sequence
const source2 = fromEvent(document, 'click') // create observable that emits click events
const example = source2.pipe(map(_event => `Event time: ${_event.timeStamp}`)) // map to string with given event timestamp
const subscribe2 = example.subscribe(val => console.log(val)) // Output (example): Event time: 7275.39000001

// Converts almost anything to an Observable.
import { from } from 'rxjs';

const array = [10, 20, 30];
const result = from(array);

result.subscribe(x => console.log(x));

// Logs:
// 10
// 20
// 30

// from converts various other objects and data types into Observables. It also converts a Promise, an array-like, or an iterable object into an Observable that emits the items in that promise, array, or iterable. A String, in this context, is treated as an array of characters.

/* TRANSFORMATION OPERATORS */

// example: 1 // Pluck the object property
const _source = from([
  {name: 'JS', age: 10},
  {name: 'RXJS', age: 7}
]);

// Grab names
const _example = _source.pipe(pluck('name'))
const _subscribe = _example.subscribe(val => console.log(val)) // Output: 'JS', 'RXJS'