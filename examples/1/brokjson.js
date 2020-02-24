function brok2geo(brok)
{
  var geo = {
    type: "FeatureCollection"
  }

  // Add unknown properties
  for(let k in brok)
  {
    if(!['properties', 'geometries', 'foreignMembers'].includes(k))
      geo[k] = brok[k]
  }

  geo.features = []

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

      // Create Feature Object
      var feature = {type: "Feature"}

      // Add Properties
      if(Object.keys(properties).length >= 0)
        feature['properties'] = properties;

      // Add Foreign members
      if(geometry.length >= 3)
      {
        for(i in geometry[2])
        {
          if(geometry[2][i] !== null && brok.foreignMembers.length >= i)
            feature[brok.foreignMembers[i]] = geometry[2][i]
        }
      }

      // Check GeometryCollection
      if(geometryCollection.type.toLowerCase() == 'geometrycollection')
      {
        new_coords = [];
        for(var c in geometryCollection['features'])
        {
          var coordinates = geometryCollection['features'][c];

          for(var g in coordinates[0])
          {
            geocol = coordinates[0][g];
            for(var t in geocol['features'])
            {
              types = geocol['features'][t];
              const coord = {
                "type": geocol['type'],
                "coordinates": types[0]
              }
              new_coords.push(coord);

            }
          }

          // Add to geometry
          feature['geometry'] = {"type": geometryCollection.type, "geometries": new_coords}
        }
      }
      else
      {
        // Geometry
        feature['geometry'] = {
          type: geometryCollection.type,
          coordinates: geometry[0]
        }
      }

      return feature;

    })

    // Merge Features
    geo.features = geo.features.concat(features)
  }

  return geo;


}