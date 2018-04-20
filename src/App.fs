module MyPWA

open Fable.Core
open Fable.Core.JsInterop
open Fable.PowerPack
open Fable.Import

// force watching of serviceworker.js by webpack
// see README.md for more information
importAll "../docs/service-worker.js"

let init() =
    let canvas = Browser.document.getElementsByTagName_canvas().[0]
    canvas.width <- 1000.
    canvas.height <- 800.
    let ctx = canvas.getContext_2d()
    // The (!^) operator checks and casts a value to an Erased Union type
    // See http://fable.io/docs/interacting.html#Erase-attribute
    ctx.fillStyle <- !^"rgb(200,0,0)"
    ctx.fillRect (10., 10., 55., 50.)
    ctx.fillStyle <- !^"rgba(0, 0, 200, 0.5)"
    ctx.fillRect (30., 30., 55., 50.)

// start our app only if our service worker registered well
promise {

    try
      // register service worker
      // serviceURL is relative to the runtime bundle location
      let! _ =  Browser.navigator.serviceWorker.register "/service-worker.js"

      // start app only if we can use the service worker
      init()
    
    with exn -> printfn "%s" exn.Message
}
|> Promise.start

