module.exports.brok2geo = brok => {
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
module.exports.geo2brok = geo => {
  var globalGeometries = []
  var globalProperties = []
  var globalForeignMembers = []

  for(i in geo.features)
  {
    const feature = geo.features[i]

    if(feature.type.toLowerCase() != 'feature')
      continue;

    // Add Properties
    var props = []
    if(feature.hasOwnProperty('properties'))
    {
      for(propertyKey in feature.properties)
      {
        // Check if item in list
        if(!globalProperties.includes(propertyKey))
        {
          // Add to List
          globalProperties.push(propertyKey)
        }

        const index = globalProperties.indexOf(propertyKey);

        // Check if props are long enough
        if(props.length - 1 < index)
          props.length = index + 1;

        props[index] = feature.properties[propertyKey]
      }
    }

    // Add Foreign Members
    var foreignMembers = []
    for(item in feature)
    {

      if(['type', 'properties', 'geometry'].includes(item.toLowerCase()))
        continue;

      // If key not in global list, add
      if(!globalForeignMembers.includes(item))
        globalForeignMembers.push(item)

      const index = globalForeignMembers.indexOf(item);

      // Check if foreignMembers is long enough
      if(foreignMembers.length - 1 < index)
        foreignMembers.length = index + 1;

      // Add foreign member
      foreignMembers[index] = feature[item];
    }

    // Process Coordinates
    var coords = null;
    if(feature.geometry.type.toLowerCase() == "geometrycollection")
    {

      // Geometry Collection detected
      coords = []

      for(iGeom in feature.geometry.geometries)
      {
        const geom = feature.geometry.geometries[iGeom]
        // Now check if last item of geometries is same type. If not, add the type
        if(coords.length == 0 || coords[coords.length - 1].type.toLowerCase() != geom.type.toLowerCase())
          coords.push({'type': geom.type, 'features': []})

        // Add feature to geometry list
        coords[coords.length - 1].features.push([geom.coordinates])
          
      }
    }
    else
    {
      // Add Coordinates
      coords = feature.geometry.coordinates
    }

    // Create Feature Array
    var brokFeature = [coords]

    // Add Properties
    if(props.length > 0)
      brokFeature.push(props)

    // Add Foreign Members
    if(foreignMembers.length > 0)
    {
      if(brokFeature.length < 2)
        brokFeature.push(None)
      
        brokFeature.push(foreignMembers)
    }

    // Now check if last item of geometries is same type. If not, add the type
    if(globalGeometries.length == 0 || globalGeometries[globalGeometries.length - 1].type.toLowerCase() != feature.geometry.type.toLowerCase())
      globalGeometries.push({'type': feature.geometry.type, 'features': []})

    // Add feature to geometry list
    globalGeometries[globalGeometries.length - 1].features.push(brokFeature)
  }

  // Build BrokJSON
  var brok = {}

  // Add Global Properties
  if(globalProperties.length > 0)
    brok.properties = globalProperties

  // Add Foreign Members
  if(globalForeignMembers.length > 0)
    brok.foreignMembers = globalForeignMembers

  // Add unknown properties
  for(member in geo)
  {
    if(!['type', 'features'].includes(member))
      brok[member] = geo[member]
  }

  // Add Geometry
  if(globalGeometries.length > 0)
    brok['geometries'] = globalGeometries

  return brok
}