const { Observable } = require("rxjs");
const { pluck, map, filter } = require("rxjs/operators");

const users = {
  data: [
    {
      id: 1,
      status: "active",
      age: 14,
    },
    {
      id: 1,
      status: "inactive",
      age: 12,
    },
    {
      id: 1,
      status: "active",
      age: 42,
    },
    {
      id: 1,
      status: "inactive",
      age: 42,
    },
    {
      id: 1,
      status: "active",
      age: 13,
    },
    {
      id: 1,
      status: "inactive",
      age: 75,
    },
    {
      id: 1,
      status: "inactive",
      age: 43,
    },
    {
      id: 1,
      status: "inactive",
      age: 54,
    },
    {
      id: 1,
      status: "active",
      age: 7,
    },
    {
      id: 1,
      status: "active",
      age: 17,
    },
  ],
};

const users2 = {
  data: [
    {
      id: 1,
      status: "inactive",
      age: 42,
    },
    {
      id: 1,
      status: "active",
      age: 13,
    },
    {
      id: 1,
      status: "inactive",
      age: 75,
    },
    {
      id: 1,
      status: "inactive",
      age: 43,
    },
    {
      id: 1,
      status: "inactive",
      age: 54,
    }
  ],
};

const observable = new Observable((subscriber) => {
  // subscriber.next(9)
  // subscriber.next(10)
  // subscriber.next(11)

  subscriber.next(users);
  // subscriber.next(user2); // This will throw an error and the below emittion will never happen(this is the default behaviour in rxjs whenever an error occured(stops everything in its track))
  // subscriber.complete(); // This will also do similar thing (stops everything in its track). B'se here we're not throwing an error but we're simply saying we're done emitting data from our observable & hit complete() in our observer
  // subscriber.next(users);
}).pipe(
  pluck("data"),
  filter((users) => users.length >= 10),
  map((users) => {
    // console.log('Got data from 2nd operator:', users);
    return users.filter((user) => user.status === "active");
  }),
  map((users) => {
    return users.reduce((sum, user) => sum + user.age, 0) / users.length;
  }),
  map((average) => {
    // console.log('Got data from the 4th operator:', average);
    if (average < 18) throw new Error(`Average age is too small (${average})`);
    else return average;
  }),
  map((average) => `The average age is ${average}`) // B'se this is the last operator, it is going to send the data to the observer
);

const observer = {
  next: (x) => console.log("Observer got a next value: " + x),
  error: (err) => console.error("Observer got an error: " + err),
  complete: () => console.log("Observer got a complete notification"),
};
const observer2 = {
  next: (x) => console.log("Observer 2 got a next value: " + x),
  error: (err) => console.error("Observer 2 got an error: " + err),
  complete: () => console.log("Observer 2 got a complete notification"),
};

observable.subscribe(observer);

observable.subscribe(observer2);
