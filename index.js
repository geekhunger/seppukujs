/*
    This module allows you to queue up functions that will run in sequence, just before your application quits.

    Most ideas derived from https://github.com/sindresorhus/exit-hook
    
    IMPORTANT NOTE:

    Every NPM library that I've tried, sends a process.exit(0) for SIGINT and SIGTERM events and so did I previously too: exit.bind(undefined, 0).
    But PM2 wouldn't let run all of the queued tasks... It just didn't resolve completely and exited almost immediately. Not sending the exit code for SIGINT, has finally worked for my PM2 cluster configuration: exit.bind(undefined, undefined).
*/

const process = require("process")
const task = new Set()

const exit = signal => {
    const handler = []
    for(const fn of task) {
        handler.push(fn())
    }
    task.clear()
    return Promise
        .all(handler) // support for async event handlers
        .then(() => {
            if(signal >= 0) process.exit(signal)
        })
        .catch(msg => {
            console.trace(msg)
            process.exit(1)
        })
}

process.on("SIGINT", exit.bind(undefined, undefined)) // see note above
process.on("SIGTERM", exit.bind(undefined, 0))

module.exports = (fn, ...args) => {
    if(typeof fn === "function") {
        task.add(args.length > 0 ? fn.bind(undefined, ...args) : fn) // register event handler
        return () => task.delete(fn) // unregister event handler
    }
    return () => {
        task.clear() // unregister all event handlers
        process.exit(0)
    }
}
