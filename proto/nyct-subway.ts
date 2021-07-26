/* eslint-disable */
import { util, configure, Writer, Reader } from 'protobufjs/minimal';
import * as Long from 'long';
import { TimeRange } from './gtfs-realtime';

export const protobufPackage = '';

export interface TripReplacementPeriod {
  /** The replacement period is for this route */
  routeId: string;
  /**
   * The start time is omitted, the end time is currently now + 30 minutes for
   * all routes of the A division
   */
  replacementPeriod: TimeRange | undefined;
}

/** NYCT Subway extensions for the feed header */
export interface NyctFeedHeader {
  /**
   * Version of the NYCT Subway extensions
   * The current version is 1.0
   */
  nyctSubwayVersion: string;
  /**
   * For the NYCT Subway, the GTFS-realtime feed replaces any scheduled
   * trip within the trip_replacement_period.
   * This feed is a full dataset, it contains all trips starting
   * in the trip_replacement_period. If a trip from the static GTFS is not
   * found in the GTFS-realtime feed, it should be considered as cancelled.
   * The replacement period can be different for each route, so here is
   * a list of the routes where the trips in the feed replace all
   * scheduled trips within the replacement period.
   */
  tripReplacementPeriod: TripReplacementPeriod[];
}

/** NYCT Subway extensions for the trip descriptor */
export interface NyctTripDescriptor {
  /**
   * The nyct_train_id is meant for internal use only. It provides an
   * easy way to associated GTFS-realtime trip identifiers with NYCT rail
   * operations identifier
   *
   * The ATS office system assigns unique train identification (Train ID) to
   * each train operating within or ready to enter the mainline of the
   * monitored territory. An example of this is 06 0123+ PEL/BBR and is decoded
   * as follows:
   *
   * The first character represents the trip type designator. 0 identifies a
   * scheduled revenue trip. Other revenue trip values that are a result of a
   * change to the base schedule include; [= reroute], [/ skip stop], [$ turn
   * train] also known as shortly lined service.
   *
   * The second character 6 represents the trip line i.e. number 6 train The
   * third set of characters identify the decoded origin time. The last
   * character may be blank "on the whole minute" or + "30 seconds"
   *
   * Note: Origin times will not change when there is a trip type change.  This
   * is followed by a three character "Origin Location" / "Destination
   * Location"
   */
  trainId: string;
  /**
   * This trip has been assigned to a physical train. If true, this trip is
   * already underway or most likely will depart shortly.
   *
   * Train Assignment is a function of the Automatic Train Supervision (ATS)
   * office system used by NYCT Rail Operations to monitor and track train
   * movements. ATS provides the ability to "assign" the nyct_train_id
   * attribute when a physical train is at its origin terminal. These assigned
   * trips have the is_assigned field set in the TripDescriptor.
   *
   * When a train is at a terminal but has not been given a work program it is
   * declared unassigned and is tagged as such. Unassigned trains can be moved
   * to a storage location or assigned a nyct_train_id when a determination for
   * service is made.
   */
  isAssigned: boolean;
  /**
   * Uptown and Bronx-bound trains are moving NORTH.
   * Times Square Shuttle to Grand Central is also northbound.
   *
   * Downtown and Brooklyn-bound trains are moving SOUTH.
   * Times Square Shuttle to Times Square is also southbound.
   *
   * EAST and WEST are not used currently.
   */
  direction: NyctTripDescriptor_Direction;
}

/** The direction the train is moving. */
export enum NyctTripDescriptor_Direction {
  NORTH = 1,
  EAST = 2,
  SOUTH = 3,
  WEST = 4,
  UNRECOGNIZED = -1,
}

export function nyctTripDescriptor_DirectionFromJSON(
  object: any,
): NyctTripDescriptor_Direction {
  switch (object) {
    case 1:
    case 'NORTH':
      return NyctTripDescriptor_Direction.NORTH;
    case 2:
    case 'EAST':
      return NyctTripDescriptor_Direction.EAST;
    case 3:
    case 'SOUTH':
      return NyctTripDescriptor_Direction.SOUTH;
    case 4:
    case 'WEST':
      return NyctTripDescriptor_Direction.WEST;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NyctTripDescriptor_Direction.UNRECOGNIZED;
  }
}

export function nyctTripDescriptor_DirectionToJSON(
  object: NyctTripDescriptor_Direction,
): string {
  switch (object) {
    case NyctTripDescriptor_Direction.NORTH:
      return 'NORTH';
    case NyctTripDescriptor_Direction.EAST:
      return 'EAST';
    case NyctTripDescriptor_Direction.SOUTH:
      return 'SOUTH';
    case NyctTripDescriptor_Direction.WEST:
      return 'WEST';
    default:
      return 'UNKNOWN';
  }
}

/** NYCT Subway extensions for the stop time update */
export interface NyctStopTimeUpdate {
  /**
   * Provides the planned station arrival track. The following is the Manhattan
   * track configurations:
   * 1: southbound local
   * 2: southbound express
   * 3: northbound express
   * 4: northbound local
   *
   * In the Bronx (except Dyre Ave line)
   * M: bi-directional express (in the AM express to Manhattan, in the PM
   * express away).
   *
   * The Dyre Ave line is configured:
   * 1: southbound
   * 2: northbound
   * 3: bi-directional
   */
  scheduledTrack: string;
  /**
   * This is the actual track that the train is operating on and can be used to
   * determine if a train is operating according to its current schedule
   * (plan).
   *
   * The actual track is known only shortly before the train reaches a station,
   * typically not before it leaves the previous station. Therefore, the NYCT
   * feed sets this field only for the first station of the remaining trip.
   *
   * Different actual and scheduled track is the result of manually rerouting a
   * train off it scheduled path.  When this occurs, prediction data may become
   * unreliable since the train is no longer operating in accordance to its
   * schedule.  The rules engine for the 'countdown' clocks will remove this
   * train from all schedule stations.
   */
  actualTrack: string;
}

const baseTripReplacementPeriod: object = { routeId: '' };

export const TripReplacementPeriod = {
  encode(
    message: TripReplacementPeriod,
    writer: Writer = Writer.create(),
  ): Writer {
    if (message.routeId !== '') {
      writer.uint32(10).string(message.routeId);
    }
    if (message.replacementPeriod !== undefined) {
      TimeRange.encode(
        message.replacementPeriod,
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): TripReplacementPeriod {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseTripReplacementPeriod } as TripReplacementPeriod;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.routeId = reader.string();
          break;
        case 2:
          message.replacementPeriod = TimeRange.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TripReplacementPeriod {
    const message = { ...baseTripReplacementPeriod } as TripReplacementPeriod;
    if (object.routeId !== undefined && object.routeId !== null) {
      message.routeId = String(object.routeId);
    } else {
      message.routeId = '';
    }
    if (
      object.replacementPeriod !== undefined &&
      object.replacementPeriod !== null
    ) {
      message.replacementPeriod = TimeRange.fromJSON(object.replacementPeriod);
    } else {
      message.replacementPeriod = undefined;
    }
    return message;
  },

  toJSON(message: TripReplacementPeriod): unknown {
    const obj: any = {};
    message.routeId !== undefined && (obj.routeId = message.routeId);
    message.replacementPeriod !== undefined &&
      (obj.replacementPeriod = message.replacementPeriod
        ? TimeRange.toJSON(message.replacementPeriod)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<TripReplacementPeriod>,
  ): TripReplacementPeriod {
    const message = { ...baseTripReplacementPeriod } as TripReplacementPeriod;
    if (object.routeId !== undefined && object.routeId !== null) {
      message.routeId = object.routeId;
    } else {
      message.routeId = '';
    }
    if (
      object.replacementPeriod !== undefined &&
      object.replacementPeriod !== null
    ) {
      message.replacementPeriod = TimeRange.fromPartial(
        object.replacementPeriod,
      );
    } else {
      message.replacementPeriod = undefined;
    }
    return message;
  },
};

const baseNyctFeedHeader: object = { nyctSubwayVersion: '' };

export const NyctFeedHeader = {
  encode(message: NyctFeedHeader, writer: Writer = Writer.create()): Writer {
    if (message.nyctSubwayVersion !== '') {
      writer.uint32(10).string(message.nyctSubwayVersion);
    }
    for (const v of message.tripReplacementPeriod) {
      TripReplacementPeriod.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): NyctFeedHeader {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNyctFeedHeader } as NyctFeedHeader;
    message.tripReplacementPeriod = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nyctSubwayVersion = reader.string();
          break;
        case 2:
          message.tripReplacementPeriod.push(
            TripReplacementPeriod.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NyctFeedHeader {
    const message = { ...baseNyctFeedHeader } as NyctFeedHeader;
    message.tripReplacementPeriod = [];
    if (
      object.nyctSubwayVersion !== undefined &&
      object.nyctSubwayVersion !== null
    ) {
      message.nyctSubwayVersion = String(object.nyctSubwayVersion);
    } else {
      message.nyctSubwayVersion = '';
    }
    if (
      object.tripReplacementPeriod !== undefined &&
      object.tripReplacementPeriod !== null
    ) {
      for (const e of object.tripReplacementPeriod) {
        message.tripReplacementPeriod.push(TripReplacementPeriod.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: NyctFeedHeader): unknown {
    const obj: any = {};
    message.nyctSubwayVersion !== undefined &&
      (obj.nyctSubwayVersion = message.nyctSubwayVersion);
    if (message.tripReplacementPeriod) {
      obj.tripReplacementPeriod = message.tripReplacementPeriod.map((e) =>
        e ? TripReplacementPeriod.toJSON(e) : undefined,
      );
    } else {
      obj.tripReplacementPeriod = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<NyctFeedHeader>): NyctFeedHeader {
    const message = { ...baseNyctFeedHeader } as NyctFeedHeader;
    message.tripReplacementPeriod = [];
    if (
      object.nyctSubwayVersion !== undefined &&
      object.nyctSubwayVersion !== null
    ) {
      message.nyctSubwayVersion = object.nyctSubwayVersion;
    } else {
      message.nyctSubwayVersion = '';
    }
    if (
      object.tripReplacementPeriod !== undefined &&
      object.tripReplacementPeriod !== null
    ) {
      for (const e of object.tripReplacementPeriod) {
        message.tripReplacementPeriod.push(
          TripReplacementPeriod.fromPartial(e),
        );
      }
    }
    return message;
  },
};

const baseNyctTripDescriptor: object = {
  trainId: '',
  isAssigned: false,
  direction: 1,
};

export const NyctTripDescriptor = {
  encode(
    message: NyctTripDescriptor,
    writer: Writer = Writer.create(),
  ): Writer {
    if (message.trainId !== '') {
      writer.uint32(10).string(message.trainId);
    }
    if (message.isAssigned === true) {
      writer.uint32(16).bool(message.isAssigned);
    }
    if (message.direction !== 1) {
      writer.uint32(24).int32(message.direction);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): NyctTripDescriptor {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNyctTripDescriptor } as NyctTripDescriptor;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.trainId = reader.string();
          break;
        case 2:
          message.isAssigned = reader.bool();
          break;
        case 3:
          message.direction = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NyctTripDescriptor {
    const message = { ...baseNyctTripDescriptor } as NyctTripDescriptor;
    if (object.trainId !== undefined && object.trainId !== null) {
      message.trainId = String(object.trainId);
    } else {
      message.trainId = '';
    }
    if (object.isAssigned !== undefined && object.isAssigned !== null) {
      message.isAssigned = Boolean(object.isAssigned);
    } else {
      message.isAssigned = false;
    }
    if (object.direction !== undefined && object.direction !== null) {
      message.direction = nyctTripDescriptor_DirectionFromJSON(
        object.direction,
      );
    } else {
      message.direction = 1;
    }
    return message;
  },

  toJSON(message: NyctTripDescriptor): unknown {
    const obj: any = {};
    message.trainId !== undefined && (obj.trainId = message.trainId);
    message.isAssigned !== undefined && (obj.isAssigned = message.isAssigned);
    message.direction !== undefined &&
      (obj.direction = nyctTripDescriptor_DirectionToJSON(message.direction));
    return obj;
  },

  fromPartial(object: DeepPartial<NyctTripDescriptor>): NyctTripDescriptor {
    const message = { ...baseNyctTripDescriptor } as NyctTripDescriptor;
    if (object.trainId !== undefined && object.trainId !== null) {
      message.trainId = object.trainId;
    } else {
      message.trainId = '';
    }
    if (object.isAssigned !== undefined && object.isAssigned !== null) {
      message.isAssigned = object.isAssigned;
    } else {
      message.isAssigned = false;
    }
    if (object.direction !== undefined && object.direction !== null) {
      message.direction = object.direction;
    } else {
      message.direction = 1;
    }
    return message;
  },
};

const baseNyctStopTimeUpdate: object = { scheduledTrack: '', actualTrack: '' };

export const NyctStopTimeUpdate = {
  encode(
    message: NyctStopTimeUpdate,
    writer: Writer = Writer.create(),
  ): Writer {
    if (message.scheduledTrack !== '') {
      writer.uint32(10).string(message.scheduledTrack);
    }
    if (message.actualTrack !== '') {
      writer.uint32(18).string(message.actualTrack);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): NyctStopTimeUpdate {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNyctStopTimeUpdate } as NyctStopTimeUpdate;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scheduledTrack = reader.string();
          break;
        case 2:
          message.actualTrack = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NyctStopTimeUpdate {
    const message = { ...baseNyctStopTimeUpdate } as NyctStopTimeUpdate;
    if (object.scheduledTrack !== undefined && object.scheduledTrack !== null) {
      message.scheduledTrack = String(object.scheduledTrack);
    } else {
      message.scheduledTrack = '';
    }
    if (object.actualTrack !== undefined && object.actualTrack !== null) {
      message.actualTrack = String(object.actualTrack);
    } else {
      message.actualTrack = '';
    }
    return message;
  },

  toJSON(message: NyctStopTimeUpdate): unknown {
    const obj: any = {};
    message.scheduledTrack !== undefined &&
      (obj.scheduledTrack = message.scheduledTrack);
    message.actualTrack !== undefined &&
      (obj.actualTrack = message.actualTrack);
    return obj;
  },

  fromPartial(object: DeepPartial<NyctStopTimeUpdate>): NyctStopTimeUpdate {
    const message = { ...baseNyctStopTimeUpdate } as NyctStopTimeUpdate;
    if (object.scheduledTrack !== undefined && object.scheduledTrack !== null) {
      message.scheduledTrack = object.scheduledTrack;
    } else {
      message.scheduledTrack = '';
    }
    if (object.actualTrack !== undefined && object.actualTrack !== null) {
      message.actualTrack = object.actualTrack;
    } else {
      message.actualTrack = '';
    }
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
