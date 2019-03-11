mapkit.init({
  authorizationCallback: function(done) {
    fetch("/token")
      .then(res => res.text())
      .then(token => done(token))
      .catch(error => {
        console.error(error);
      });
  }
});

const center = new mapkit.Coordinate(45.51276032190637, -122.65946745872498),
  span = new mapkit.CoordinateSpan(0.025, 0.025),
  region = new mapkit.CoordinateRegion(center, span);

let map = new mapkit.Map("map", {
  region: region,
  showsCompass: mapkit.FeatureVisibility.Hidden,
  showsZoomControl: false,
  showsMapTypeControl: false
});

map.annotationForCluster = clusterAnnotation => {
  if (clusterAnnotation.clusteringIdentifier === "hub") {
    const currentBikes = clusterAnnotation.memberAnnotations.reduce(
      (total, memberAnnotation) => total + memberAnnotation.data.current_bikes,
      0
    );

    return new mapkit.MarkerAnnotation(clusterAnnotation.coordinate, {
      glyphText: `${currentBikes}`,
      color: currentBikes === 0 ? "#8e8e93" : "#4cd964",
      displayPriority: 750
    });
  }

  if (clusterAnnotation.clusteringIdentifier === "bike") {
    return new mapkit.MarkerAnnotation(clusterAnnotation.coordinate, {
      glyphText: `${clusterAnnotation.memberAnnotations.length}`,
      color: "#007AFF",
      displayPriority: 500,
      titleVisibility: mapkit.FeatureVisibility.Hidden
    });
  }
};

fetch("/geo/portland.geojson")
  .then(res => res.json())
  .then(geojson => {
    const feature = geojson;
    const polygon = feature.geometry;
    const overlay = new mapkit.PolygonOverlay(
      polygon.coordinates.map(coordinates =>
        coordinates.map(point => new mapkit.Coordinate(point[1], point[0]))
      ),
      new mapkit.Style({
        strokeColor: "#000",
        strokeOpacity: 0.8,
        lineWidth: 5,
        fillOpacity: 0.4,
        fillColor: "#CACACA"
      })
    );
    map.addOverlay(overlay);
  })
  .catch(error => {
    console.error(error);
  });

fetch("/geo/hubs.geojson")
  .then(res => res.json())
  .then(geojson => {
    let hubAnnotations = [];
    let hubOverlays = [];

    for (const feature of geojson["features"]) {
      const polygon = feature.geometry.geometries[0];
      const point = feature.geometry.geometries[1];

      const overlay = new mapkit.PolygonOverlay(
        polygon.coordinates[0].map(
          point => new mapkit.Coordinate(point[1], point[0])
        )
      );
      hubOverlays.push(overlay);

      const annotation = new mapkit.MarkerAnnotation(
        new mapkit.Coordinate(point.coordinates[1], point.coordinates[0]),
        {
          title: feature.properties.name,
          subtitle: feature.properties.address,
          data: feature.properties,
          clusteringIdentifier: "hub",
          glyphText: `${feature.properties.current_bikes}`,
          color: feature.properties.current_bikes === 0 ? "#8e8e93" : "#4cd964",
          displayPriority: 100 + feature.properties.racks_amount,
          callout: {}
        }
      );
      hubAnnotations.push(annotation);
    }

    map.addOverlays(hubOverlays);
    map.addAnnotations(hubAnnotations);
  })
  .catch(error => {
    console.error(error);
  });

fetch("/geo/bikes.geojson")
  .then(res => res.json())
  .then(geojson => {
    let bikeAnnotations = [];

    for (const feature of geojson["features"]) {
      const point = feature.geometry;

      const annotation = new mapkit.MarkerAnnotation(
        new mapkit.Coordinate(point.coordinates[1], point.coordinates[0]),
        {
          title: feature.properties.name,
          subtitle: feature.properties.address,
          clusteringIdentifier: "bike",
          glyphImage: { 1: "/images/bike.svg" },
          color: "#007AFF",
          titleVisibility: mapkit.FeatureVisibility.Hidden,
          displayPriority: 100,
          callout: {}
        }
      );
      bikeAnnotations.push(annotation);
    }

    map.addAnnotations(bikeAnnotations);
  })
  .catch(error => {
    console.error(error);
  });
