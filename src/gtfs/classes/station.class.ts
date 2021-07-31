export class Station {
  public lastUpdate: number;
  public trains: any;
  public routes: any[];
  public station: any;

  constructor(station) {
    this.lastUpdate = null;
    this.trains = [];
    this.station = station;
    this.routes = [];
  }

  public addTrain(props: {
    routeId: string,
    trainTime: number,
    feedTime: number,
    tripId: string,
    stopId: string,
  }): void {
    const { routeId, trainTime, tripId, feedTime, stopId } = props;
    if (this.routes.indexOf(routeId) < 0)
      this.routes.push(routeId);
    this.trains.push({
      route: routeId,
      time: trainTime,
      tripId,
      stopId,
    });
    this.lastUpdate = feedTime;
  }

  public clearTrainData(): void {
    this.trains = [];
    this.routes = [];
    this.lastUpdate = null;
  }

  public sortTrains(maxTrains) {
    this.trains.sort((a, b) => (a.time > b.time) ? 1 : -1).slice(0, maxTrains);
  }

  public serialize() {
    const { routes, trains, lastUpdate } = this;
    return {
      ...this.station,
      routes,
      trains,
      lastUpdate,
    }
  }
}
