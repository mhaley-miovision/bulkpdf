Miovision Organization Tool
The goal of this software is to enable rapid prototyping of the organizational mangement concepts that Miovision wishes to employ. Given that the constructs being used aren't readily available in the indusdry, until "how we want to do things" stabilizes, we need a quick way to iterate over the process and terminology.

Current setup
- Google docs is being used as the data store and can be manually edited for quick changes without technical knowledge
- Java client code used to implement model reading ability from the Google doc data model, and into POJOs
- Model rendering ability is implemented using jGraphx (formerly mxGraph, powering draw.io, and open-source Visio alternative) and saved as XML and/or an image
