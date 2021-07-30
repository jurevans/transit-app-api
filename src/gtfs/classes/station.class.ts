export class Station {
  public last_update: number;
  public trains: any;
  public routes: any[];
  public station: any;

  constructor(station) {
    this.last_update = null;
    this.trains = [];
    this.station = station;
    this.routes = [];
  }

  public addTrain(props: {
    routeId: string,
    direction: string,
    trainTime: number,
    feedTime: number,
  }): void {
    const { routeId, trainTime, feedTime } = props;
    if (this.routes.indexOf(routeId) < 0)
      this.routes.push(routeId);
    this.trains.push({
      route: routeId,
      time: trainTime,
    });
    this.last_update = feedTime;
  }

  public clearTrainData(): void {
    this.trains = [];
    this.routes = [];
    this.last_update = null;
  }

  public sortTrains(maxTrains) {
    this.trains.sort((a, b) => (a.time > b.time) ? 1 : -1).slice(0, maxTrains);
  }

  public serialize() {
    const { N, S } = this.trains;
    return {
      N,
      S,
      routes: this.routes,
      last_update: this.last_update,
      ...this.station,
    }
  }
}
