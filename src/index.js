module.exports.brok2geo = brok => {
  var geo = {
    type: "FeatureCollection",
    features: []
  }

  for(let i in brok.geometries)
  {
    const geometryCollection = brok.geometries[i];

    const features = geometryCollection.features.map(geometry => {

      // Properties
      var properties = {}
      if(geometry.length >= 2)
      {
        for(let p in geometry[1])
        {
          const prop = geometry[1][p];
          if(prop === null)
            continue
          
          properties[brok.properties[p]] = prop;
        }
      }

      // ToDo: Add Foreign Members!

      // Create Feature Object
      var feature = {type: "Feature"}

      // Add Properties
      if(Object.keys(properties).length >= 0)
        feature['properties'] = properties;

      // Geometry
      feature['geometry'] = {
        type: geometryCollection.type,
        coordinates: geometry[0]
      }

      return feature;

    })

    // Merge Features
    geo.features = geo.features.concat(features)
  }

  return geo;


}