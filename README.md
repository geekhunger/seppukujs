# How-To

This module allows you to queue up tasks, that will be run in sequence, just before your application quits. You can use this to close alive database connections, stop active cronjobs or clean-up the memory before the process gets killed. However, you should not use async function calls or put off application termination, because your application is about to kill itself anyways. Perform mandatory tasks and be okay with it.^^

```js
const die = require("seppukujs")

// register an event handler that will be fired once the current process is closed/killed
// function call returns a pointer to unregister that event handler again (most of the time you won't need that)
const stop_saying_goodbye = die(console.log.bind(undefined, "goodbye world"))

// unregister the event handler from the queue of signal listeners so that it won't be fired on close/kill of the process
stop_saying_goodbye()

die(function() {
    // do whatever you want inside this function...
    console.warn("did something :)")
})

die(() => {
    // same as above, but with arrow-function syntax...
})

// calling die() without any arguments will return a function to clear the entire queue of already registered event handlers!
const clear_entire_queue = die()
clear_entire_queue()

// same as above, but with shorthand syntax
die()()
```
