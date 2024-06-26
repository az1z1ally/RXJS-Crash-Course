import { from, fromEvent, of, Observable, pluck, catchError, EMPTY, exhaustMap, BehaviorSubject, Subject } from 'rxjs'
import { concatMap, debounceTime, distinctUntilChanged, map, startWith, delay, filter, switchMap, tap } from 'rxjs/operators'

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

// from -- Converts almost anything to an Observable.

const array = [10, 20, 30];
const result = from(array);

result.subscribe(x => console.log(x));

// Logs:
// 10
// 20
// 30

// from converts various other objects and data types into Observables. It also converts a Promise, an array-like, or an iterable object into an Observable that emits the items in that promise, array, or iterable. A String, in this context, is treated as an array of characters.


// example: 1 // Pluck the object property
const _source = from([
  {name: 'JS', age: 10},
  {name: 'RXJS', age: 7}
]);

// Grab names
const _example = _source.pipe(pluck('name'))
const _subscribe = _example.subscribe(val => console.log(val)) // Output: 'JS', 'RXJS'


/* 
Note: Operators like map, filter, etc. they operate on the stream emission not the value of the stream emission
For example if you have a stream which is emitting array of numbers say [0,1..100] and you try to pass like this
to map() like this map(x => x * 10), it won't work b'se the map() operator is going to take the entire array as 
a value & try to multiply it by 10. The solution will be to use the standard array's map() inside the map operator.
as follows map(x => x.map(n => n * 10))
*/

/* TRANSFORMATION OPERATORS */
const getChecklistById = (id) => {
  return this.getChecklists().pipe(
    filter((checklists) => checklists.length > 0), // Don't emit if the checklists haven't loaded yet
    map((checklists) => checklists.find((checklist)=> checklist.id === id))
  )
}


// switchMap -- switch from one stream to another stream
const feedback$ = this.route.paramMap.pipe(
  switchMap((params) => 
    this.clientStore.feedbacks$.pipe(
      map((feedbacks) =>
        feedbacks
        ? feedbacks.find((feedback) => feedback.id === params.get('id'))
        : null
      )
    )
  )
) // Get some values from one stream & then switchMap() to another stream that needs those values

/* Above if we started directly with the feedback stream forexample, we would'nt have access to the params.get('id'), 
therefore; we would'nt be able to filter the specific feedback information that we want.

But since we do need that value(id), we started with the stream that has that value and then switch to the second stream 
passing in those values that i need from 1st stream.

One thing to note is, let say the inner stream is http request and take some time to finish, if there is a new emission from outside, switchMap()
will say okay there is a new stream so kill this request and use the value from the new emission instead. Eg. user issues a search
then issues another search with the new search term immediately before the previous one has finished, siwtchMap() will cancel the 
first serach request and issue another request with new search term.
*/

// concatMap() -- wait for each inner subscription to finish before moving on to the next emission, this is essentially creating an orderly queue.
currentPhoto$: Observable<Photo> | undefined

const setPhotos = (value: Photo[]) => {
  this.currentPhoto$ = from([...value].reverse()).pipe(
    // For each emission, switch to a stream of just that one value -> each emission get addressed in the order it arrives
    concatMap((photo) => 
      of(photo).pipe(
        // Wait for 500ms before making it the current photo
        // Then concatMap() will move on to the next photo
        delay(500)
      )
    )
  )
} // We used concatMap() in this case b'se each time we get a stream emission of a photo, we want to ensure that the inner subscription is finished b4 moving on to the next emission

// In the above we have a stream of all photos in the application, we then display them one by one with delay of 500ms


// mergeMap() - convert all observables into a single stream of observable.

/* It is kind of similar to concatMap() in the sense that it completes all inner observables. But unlike concatMap() which will complete one at a time in order, mergeMap() is like a free fall 
where everything is just subscribed at once regardless of the order, so if the order does'nt matter you want everything to be done as quickly as possible you can use mergeMap()
*/

const operatorfunc = (operator: any) => () => {
  from([0, 1, 2, 3, 4, 5])
    .pipe(operator((x: any) => of(x).pipe(delay(500))))
    .subscribe(
      console.log,
      () => {},
      () => console.log(`${operator.name} completed`)   
    )
}

operatorfunc(switchMap)()
// If the new value is coming from the source observable, but the previously mapped observable is not yet fulfilled, then the new value from the source observable will be ignored. It is perfect for handling events that might be triggered multiple times in rapid succession but where only the initial trigger should be acted upon untill it completes.
operatorfunc(exhaustMap)() // This will display 0 in this case because of the delay since the 1st observable still exist. 
operatorfunc(switchMap)()

/* JOIN CREATION OPERATORS */
// combineLatest() -- create a new stream from scratch, it take the last emission from its input stream & emit them all together. 

// One thing to note combineLatest() will wait untill all of its input stream has emitted atleast one value. If one of the input had'snt emitted any value yet, then our combineLatest() stream would'nt emit anything either

/* OTHER OPERATORS */
// startWith(1)

// debouceTime(10)

// distinctUntillChanged() -- Emit a value only when it has changed

const searchInputControl = this.searchForm.get('searchInput');

// Subscribe to search input changes and apply debounce
searchInputControl.valueChanges.pipe(
  // If there is an error just return an empty observable
  // This prevents the stream from breaking, otherwise your entire stream is going to be destroyed if you don't catch & handle an error
  catchError(() => EMPTY), // It basically do nothing but make sure our process here is still working for the next emission
  startWith(''),
  debounceTime(1000),
  distinctUntilChanged()).subscribe((searchText: string) => {
  this.searchText = searchText
  this.triggerSearch();
})

// or

searchInputControl.valueChanges.pipe(
  debounceTime(1000), // Emits a notification from the source Observable only after a particular time span has passed without another source emission.
  distinctUntilChanged(),
  startWith(searchInputControl.value),

  tap((searchText: string) => {
    this.searchText = searchText
    this.triggerSearch();
  })
)

// Listen for blur event to clear results
searchInputControl.valueChanges.pipe(debounceTime(200)).subscribe(() => {
  // Clear results when the input loses focus and value is empty
  if (!this.isSearchInputFocused() && searchInputControl.touched && searchInputControl.invalid) {
    this.searchResults = [];
  }
}))


// Dispatch & select
	
	
/*
Certainly! Let’s dive deeper into the behavior of observables and how it relates to your specific use case.

1. Observables and Asynchronous Data Streams:
- In Angular (and other reactive programming frameworks), observables represent asynchronous data streams.
- When you subscribe to an observable, you’re essentially listening for emissions (values) that occur over time.
- Each emission can be a new value, an error, or a completion signal.

2. Behavior of take(1) Operator:
- The take(1) operator limits the observable stream to only one emission.
- After receiving the first value, the subscription is automatically unsubscribed.
- This is useful when you want to handle only the initial data (e.g., fetching data from an API).

3. Your Original Code:
	this.store.dispatch(AircraftActions.getAircraftByUid({uid: this.selectedUuid}))
	this.store.select(selectOneAirCraftUid(this.selectedUuid))
	  .pipe(
	  catchError(err => EMPTY),
	  tap((aircraft) => {
		if (aircraft) {
		  this.aircraft = aircraft
		  console.log('iar=====', aircraft)
		  this.aircraftForm.patchValue({
			...this.aircraft,
			airlineUid: this.aircraft.airline.uid,
			aircraftTypeUid: this.aircraft.aircraftType.uid
		  });
		}
	  }),
	  take(1), // Take only one emission to avoid memory leaks
	  // Since you only need to receive the aircraft data once and patch it into your form, using take(1) ensures that the subscription is automatically unsubscribed after receiving the first emission, thus preventing any potential memory leaks.
	).subscribe()
	
	
- In your original code, you used take(1) after selecting the aircraft from the store.
- As a result, only the initial data (including airlineUid and aircraftTypeUid) was patched into the form.
- Subsequent updates (if any) were ignored because the subscription closed after the first emission.

4. Alternative Approach (Manual Unsubscription):
- If you want to keep the subscription open for subsequent updates, you can manually unsubscribe when you’re done processing the initial data.
- Here’s the modified code snippet:

this.store.dispatch(AircraftActions.getAircraftByUid({uid: this.selectedUuid}))
this.store.select(selectOneAirCraftUid(this.selectedUuid)).pipe(
  catchError(err => EMPTY),
  take(1), // Take only one emission initially
  tap((aircraft) => {
    if (aircraft) {
      this.aircraft = aircraft;
      console.log('iar=====', aircraft);
      this.aircraftForm.patchValue({
        ...this.aircraft,
        airlineUid: this.aircraft.airline.uid,
        aircraftTypeUid: this.aircraft.aircraftType.uid
      });
    }
  })
).subscribe().unsubscribed(); // Manually unsubscribe when no longer needed

5. Considerations:
- Use take(1) if you’re interested only in the initial data (e.g., fetching details from an API).
- Use manual unsubscription if you need to handle subsequent updates (e.g., real-time updates or form changes).


*/

interface UserInterface  {
  id: string
  name: string
}

const users$ = new BehaviorSubject<UserInterface[]>([])
const subject$ = new Subject()

// We can update value stored in BehaviorSubject, which means we can store some state inside it which we can use in our components, this is the reason BehaviorSubject is often used that Subject
// Also we can subscribe to both Subject & BehaviorSubject just like obsersavable streams

// Subject does'nt store value inside, we don't have getValue() inside subject, subject just propagate value to all our listeners when we call next().
// Unlike BehaviorSubject, Subject doesn't have an initial value

// SUBSCRIPTIONS unsubscribe to avoid memory leaks
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy{
  data$ = interval(1000)
  user$ = from([{id: "1", name: "JS"}, {id: "2", name: "Angular"}])
  // dataSubscription: Subscription | undefined;
  unsubscribe$ = new Subject<void>()

  ngOnInit() {
	// this.data$.pipe(take(1))  // limit the obsersavable to only first emission
		// .subscribe((data) => {
			// console.log('data', data )
		// })
  
  
	// this.dataSubscription = this.data$.subscribe((data) => console.log('data', data ))
	// this.data$.pipe(takeWhile(value) => value < 5)  // emits while value is less than 5
		// .subscribe((data) => {
			// console.log('data', data )
		// })
		
		
	// takeUntil emits values from the source obsersavable untill the notifier obsersavable emits a value
	// It is the best code for unsubscribe since we don't need to create a new property for every single subscription
	this.data$.pipe(takeUntil(this.unsubscribe$)) // subscribe to data$ obsersavable until unsubscribe$ emits a value
		.subscribe((data) => {
			console.log('data', data )
		})
		
	this.user$.pipe(takeUntil(this.unsubscribe$)) // subscribe to data$ obsersavable until unsubscribe$ emits a value
		.subscribe((data) => {
			console.log('data', data )
		})
  }

  ngOnDestroy(): void {
    // this.dataSubscription?.unsubscribe()
	this.unsubscribe$.next()
	this.unsubscribe$.complete()
  } 
}

// We can create a class that do the unsubscribe and extends it inside components every time we want to use it

import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export abstract class Unsub implements OnDestroy {
  unsubscribe$ = new Subject<void>()

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  } 
}

}

// Implementation
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class Post extends Unsub implements OnInit {
	// Your Code
}

