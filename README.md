# Fable Simple PWA

Ok so you want to build a Progressive Web application using [Fable](http://fable.io/)? Then you're in the right place!

Grab your mobile phone and browse to: [https://whitetigle.github.io/fable-pwa/](https://whitetigle.github.io/fable-pwa/)

## Requirements

* [dotnet SDK](https://www.microsoft.com/net/download/core) 2.0 or higher
* [node.js](https://nodejs.org) 6.11 or higher
* [yarn](https://yarnpkg.com)

Although is not a Fable requirement, on macOS and Linux you'll need [Mono](http://www.mono-project.com/) for other F# tooling like Paket or editor support.

## Build & Run

* Install JS dependencies: `yarn install`
* **Move to `src` folder**: `cd src`
* Install F# dependencies: `dotnet restore`
* Start Fable daemon and [Webpack](https://webpack.js.org/) dev server: `dotnet fable yarn-start`
* In your browser, open: http://localhost:8080/

> `dotnet fable yarn-start` (or `npm-start`) is used to start the Fable daemon and run a script in package.json concurrently. It's a shortcut of `yarn-run [SCRIPT_NAME]`, e.g. `dotnet fable yarn-run start`.

If you are using VS Code + [Ionide](http://ionide.io/), you can also use the key combination: Ctrl+Shift+B (Cmd+Shift+B on macOS) instead of typing the `dotnet fable yarn-start` command. This also has the advantage that Fable-specific errors will be highlighted in the editor along with other F# errors.

Any modification you do to the F# code will be reflected in the web page after saving. When you want to output the JS code to disk, run `dotnet fable yarn-build` and you'll get a minified JS bundle in the `public` folder.

## How it works

Let's say that a Progressive Web Application is simply a web app you want your user to access at the best conditions: obviously making it more responsive thanks to caching strategies for instance. 

So when your user goes to your web site, let's say **https://myNextAwesomeFable.App.net**, he'll be offered the choice to add the web site/app to his system/home screen (desktop/mobile). 

For instance on Android, a shortcut will be added and then when the use taps on the icon of this app, the web site will run in its own context and load assets from a local cache thanks to a service-worker. This context is called **App Shell**.

So your web site/app will run just like a **native app** with its icon and all.

### So The App Shell approach allows websites to be:

- **Linkable**: Even if it behaves like a native app, it is still a website — you can click on the links within the page and send a URL to someone if you want to share it.

- **Progressive**: Start with the "good, old basic website” and progressively add new features while remembering to detect if they are available in the browser and gracefully handle any errors that crop up if support is not available. For example, an offline mode with the help of service workers is just an extra trait that will make your website experience better, but it's still perfectly usable without it.

- **Responsive**: Responsive Web Design also applies to Progressive Web Apps, as both are mainly for mobile. There are so many varied devices with browsers — it's important to prepare your website so it works on different screen sizes, viewports or pixel densities, using technologies like viewport meta tag, CSS media queries, Flexbox, and CSS Grid.

(Extracts from [Mozilla documentation](https://developer.mozilla.org/en-US/Apps/Progressive))

### manifest.webmanifest

The manifest file is a JSON file that allosw you to control how your app appears to the user. It's pretty easy to understand.

```json
{
  "short_name": "MyFablePWA",
  "name": "Fable powered PWA",
  "start_url": "/index.html",
  "icons": ...
}
```

**This is also this file that will allow to add a nice shortcut to your app.**

There are other fields you can add and which are very well documented [here](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### Service Workers

Enter our nice workers that make the magic possible.
You can read [awesome doc on Mozilla's site](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)

But I will try to sum things up for you here.
Basically, let's say a service Worker allows you to

1. to manage your cache 
2. proxy all outgoing request

### service-worker.js

So, the ``service-worker.js`` file is where all the plumbing happens:

1. **install the worker**: usually it's here we cache our assets. Once the worker is installed it will stay there until the end of the world. (I'll get back to that later)
2. **activate the worker**: once it's up and running, the web worker will update its cache only when we tell him to do so, meaning when we change the cache name for instance.
3. **handle events**: there are several events that can be handled by the worker. The most known being the fetch event which will gracefully allow your app to make its call to, let's say, your server or CDNs.

#### What's inside
**A cache name**: 

```js
var CACHE_NAME = 'my-fable-app-cache-0.1';
```

**A list of assets to cache**: 

```js
var resourcesToCache = [
    '/',
    'https://cdn.polyfill.io/v2/polyfill.js?features=es6,fetch',    
    '/index.html',
    '/bundle.js'
];
```

In this list you should add all the local and remote assets you would need and you'd like to cache.

**Our plumbing event listeners**: 

```js
self.addEventListener('install', function(event) {...

self.addEventListener('activate', function(event) {...

self.addEventListener('fetch', function(event) {...
```

Now we only need to register our ``service-worker.js`` file to make it working.

### register-service-worker.js

There are two ways of doing that.

#### Fable/F# way 
 **Important**: this is not yet possible with current version of Fable.Import
  
  It should like this in ``App.fs``:

```fsharp

// start our app only if our service worker registered well
open Fable.PowerPack
open Fable.Import

promise {

    try
      // register service worker
      let! _ = "/service-worker.js" |> Browser.navigator.serviceWorker.register

      // start app only if registration works
      init()

    with exn -> printfn "%s" exn.Message
}
|> Promise.start
```
and

```html
<body>
  ...no need to call any extra script to register the service-worker.js file
  <script src="bundle.js"></script>
</body>
```


#### Classic JS approach

or the js way which implies 2 things:

1. we have a ``register-service-worker.js`` file ready
2. we call it before ``bundle.js`` from our index.html file

So it would look like:

```html
<body>
  ...
  <script src="register-service-worker.js"></script>
  <script src="bundle.js"></script>
</body>
```

and 

```js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
    .then(function() {
        console.info('service worker succesfully registered');
    }).catch(function(e) {
        console.error(e, 'service worker registration failed');
    });
}
```

> If we take alook at [CanIUse](https://caniuse.com/#feat=serviceworkers)  I think we can safely assume that service workers are now taken care of in every modern browsers.

## Life of a web service

There are many great articles to read about ServiceWorkers and Progressive Web Apps. There's especially something which you should be aware of:

### Offline first

Now you've installed your Service Worker, it will always be there making sure everything's running smooth without any Internet connection.
What does it mean? Well it means that you nay not see anything changing the next time you update your app. Why? Because it's been cached already. So here is the most important things you should always do:

> **service-worker.js**: Change the cache label/version number 

### Hey, I did that but my display just did not update!

Yes, because you will have to **force the service worker to update** and **you can't do it just by hitting the refresh button of your browser.**.

It's because to ensure the app consistency for the client, we can't just update the app while it's running.
So you've updated your app and now you need to upgrade your service worker to the new version. It means you need to remove the old version first.

So update your app, change your cache version number, close all your tabs to kill the app and clean your browser cache.

**Reload**: now you've got your new version available.
There are other strategies, but I won't dig into the details here. Please read [this](https://redfin.engineering/service-workers-break-the-browsers-refresh-button-by-default-here-s-why-56f9417694) and [this](https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68) if you want more information. (It's worth the read!)

## Security considerations

#### Prepare your SSL certificate.
PWA work only through https. Period. 
On your desktop browser you won't really get problems with SSL certificates because it will try to load any missing part.
But on the mobile side, you will if you the certificates you provide are not complete: you absolutely need a **FULL and VALID certificate**.

So go on a SSL test site like this [one](https://www.ssllabs.com/ssltest/) and make sure your certificate passes the tests.

#### CORS
Since you will make remote calls using fetch, you'll probably end up with CORS issues.
So prepare your servers, load balancers and all to handle cross origin requests.

#### Foreign fetch
I have not yet taken time to dig into that, but Foreign Fetch should be there to help avoir cross origin related problems.

#### Modern Internet

Well it should be a surprise for a web developer but now that browser vendors are deprecating http requests in favor of https, the whole pipeline must be ready for that :)

## Development guidelines

There are a few things you should know to avoid losing too much time solving issues during your development with Fable.

### 1. Use Service workers ONLY when you need them

Just code your app, update, test it with your ``dotnet fable yarn-start`` like you would usually do and enable/register your service worker only when you actually need to use/test it.

If you don't do that, you'll end up screaming because you don't see your changes reflected in your browser because, as you now understand, once it's started, **a Serice Worker will remain alive until you actually unregister it.**

The same goes when you want to update your app: disable Service Worker, make your changes, test them and then when you're done, uncomment your registration code.

### 2. Avoid localhost:8080 nightmare

Dy default, we use ``localhost:8080`` to work on our fable apps. If you decide to work on a new project, you may experience something weird: you actually see the last project you were working on!

Because, as you now understand, once it's started, **a Serice Worker will remain alive until you actually unregister it.**

So it means it will outlive your development cycle and remain there forever **at the address you hosted it to**.
Don't be afraid. Relax. Just unregister yuor service worker it and now you can see your actual project on screen.

### 3. Unregister a service worker

It's easy:

1. *Chrome*: go to the Application tab and unregister the service worker
2. *Firefox*: browse to [about:serviceworkers](about:serviceworkers) and there you'll be able to unregister them

### 4. Remotely debug your web app

It's not really linked to PWAs but if you're using Firefox, use its great [WebIDE](https://developer.mozilla.org/en-US/docs/Tools/WebIDE) which will help you understand what's goin on on your remote device by making the whole developer console available on your desktop.

It's called Remote Debugging and you should definitely use it!

# Update this sample to your needs

## From docs to public
The current project will build to the ``docs`` folder to enable GitHub hosting.

Don't forget to modify the ``webpack.config.js file`` like this in order to allow the building of ``bundle.js`` into the public folder:

change 

```json
var outputFolder = "./docs";
```

to 

```json
var outputFolder = "./public";
```

## cache path
If you pick a look at the resourcesCache variable in ``service-worker.js``, you'll see that I've added ``/fable-pwa/`` in front of my ressources. 

```js
var resourcesToCache = [
    '/fable-pwa/',
    'icons/android-icon-144x144.png',
    ...
    'https://cdn.polyfill.io/v2/polyfill.js?features=es6,fetch',
    '/fable-pwa/index.html',
    '/fable-pwa/bundle.js'
];
```

So just remove these in order to get the sample working on your host:

```js
var resourcesToCache = [
    '/',
    'icons/android-icon-144x144.png',
    ...
    'https://cdn.polyfill.io/v2/polyfill.js?features=es6,fetch',
    '/index.html',
    '/bundle.js'
];
```

# To be continued
I will definitely update this project with latest news and information I get from my ongoing PWA projects.
Thanks for reading and have fun deploying your pwa app!