/* eslint-disable */
import { util, configure, Writer, Reader } from 'protobufjs/minimal';
import * as Long from 'long';
import { EntitySelector, TranslatedString } from './gtfs-realtime';

export const protobufPackage = 'transit_realtime';

/**
 * Copyright 2020 Metropolitan Transportation Authority
 *
 * Mercury extensions for the GTFS-realtime protocol.
 */

/** Mercury extensions for the Feed Header */
export interface MercuryFeedHeader {
  /**
   * Version of the Mercury extensions
   * The current version is 1.0
   */
  mercuryVersion: string;
}

export interface MercuryStationAlternative {
  affectedEntity: EntitySelector | undefined;
  notes: TranslatedString | undefined;
}

/** Mercury extensions for the Feed Alert */
export interface MercuryAlert {
  createdAt: number;
  updatedAt: number;
  alertType: string;
  stationAlternative: MercuryStationAlternative[];
  servicePlanNumber: string[];
  generalOrderNumber: string[];
  /**
   * A time interval, in seconds, indicating how long before each active period
   * consumers should display this alert. A value of 3600 here, for example,
   * suggests that this alert should be displayed 1 hour before each active
   * period. Consumers may choose to ignore this recommendation and display (or
   * not display) alerts based on their own logic if they so choose.
   */
  displayBeforeActive: number;
  /**
   * A human-friendly string that summarizes all active periods for this Alert,
   * i.e. "Sundays in May from 10:45pm to midnight"
   */
  humanReadableActivePeriod: TranslatedString | undefined;
  additionalInformation: TranslatedString | undefined;
  directionality: number;
  affectedStations: EntitySelector[];
  screensSummary: TranslatedString | undefined;
  noAffectedStations: boolean;
  /** The ids of the planned work cloned from */
  cloneId: string;
}

/** Mercury extensions for the Feed Entity Selector */
export interface MercuryEntitySelector {
  /** Format for sort_order is 'GTFS-ID:Priority', e.g. 'MTASBWY:G:16' */
  sortOrder: string;
}

export enum MercuryEntitySelector_Priority {
  PRIORITY_ESSENTIAL_SERVICE = 1,
  PRIORITY_WEEKEND_SERVICE = 2,
  PRIORITY_WEEKDAY_SERVICE = 3,
  PRIORITY_SUNDAY_SCHEDULE = 4,
  PRIORITY_SATURDAY_SCHEDULE = 5,
  PRIORITY_HOLIDAY_SERVICE = 6,
  PRIORITY_EXTRA_SERVICE = 7,
  PRIORITY_SPECIAL_SCHEDULE = 8,
  PRIORITY_PLANNED_WORK = 9,
  PRIORITY_PLANNED_BOARDING_CHANGE = 10,
  PRIORITY_BOARDING_CHANGE = 11,
  PRIORITY_SLOW_SPEEDS = 12,
  PRIORITY_EXPECT_DELAYS = 13,
  PRIORITY_SOME_DELAYS = 14,
  PRIORITY_SPECIAL_EVENT = 15,
  PRIORITY_PLANNED_STATIONS_SKIPPED = 16,
  PRIORITY_STATIONS_SKIPPED = 17,
  PRIORITY_DELAYS = 18,
  PRIORITY_PLANNED_EXPRESS_TO_LOCAL = 19,
  PRIORITY_EXPRESS_TO_LOCAL = 20,
  PRIORITY_SOME_REROUTES = 21,
  PRIORITY_PLANNED_LOCAL_TO_EXPRESS = 22,
  PRIORITY_LOCAL_TO_EXPRESS = 23,
  PRIORITY_PLANNED_BUSES_DETOURED = 24,
  PRIORITY_BUSES_DETOURED = 25,
  PRIORITY_SERVICE_CHANGE = 26,
  PRIORITY_PLANNED_TRAINS_REROUTED = 27,
  PRIORITY_TRAINS_REROUTED = 28,
  PRIORITY_BUSING = 29,
  PRIORITY_PLANNED_PART_SUSPENDED = 30,
  PRIORITY_PART_SUSPENDED = 31,
  PRIORITY_PLANNED_MULTIPLE_IMPACTS = 32,
  PRIORITY_MULTIPLE_IMPACTS = 33,
  PRIORITY_SUSPENDED = 34,
  PRIORITY_NO_SCHEDULED_SERVICE = 35,
  UNRECOGNIZED = -1,
}

export function mercuryEntitySelector_PriorityFromJSON(
  object: any,
): MercuryEntitySelector_Priority {
  switch (object) {
    case 1:
    case 'PRIORITY_ESSENTIAL_SERVICE':
      return MercuryEntitySelector_Priority.PRIORITY_ESSENTIAL_SERVICE;
    case 2:
    case 'PRIORITY_WEEKEND_SERVICE':
      return MercuryEntitySelector_Priority.PRIORITY_WEEKEND_SERVICE;
    case 3:
    case 'PRIORITY_WEEKDAY_SERVICE':
      return MercuryEntitySelector_Priority.PRIORITY_WEEKDAY_SERVICE;
    case 4:
    case 'PRIORITY_SUNDAY_SCHEDULE':
      return MercuryEntitySelector_Priority.PRIORITY_SUNDAY_SCHEDULE;
    case 5:
    case 'PRIORITY_SATURDAY_SCHEDULE':
      return MercuryEntitySelector_Priority.PRIORITY_SATURDAY_SCHEDULE;
    case 6:
    case 'PRIORITY_HOLIDAY_SERVICE':
      return MercuryEntitySelector_Priority.PRIORITY_HOLIDAY_SERVICE;
    case 7:
    case 'PRIORITY_EXTRA_SERVICE':
      return MercuryEntitySelector_Priority.PRIORITY_EXTRA_SERVICE;
    case 8:
    case 'PRIORITY_SPECIAL_SCHEDULE':
      return MercuryEntitySelector_Priority.PRIORITY_SPECIAL_SCHEDULE;
    case 9:
    case 'PRIORITY_PLANNED_WORK':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_WORK;
    case 10:
    case 'PRIORITY_PLANNED_BOARDING_CHANGE':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_BOARDING_CHANGE;
    case 11:
    case 'PRIORITY_BOARDING_CHANGE':
      return MercuryEntitySelector_Priority.PRIORITY_BOARDING_CHANGE;
    case 12:
    case 'PRIORITY_SLOW_SPEEDS':
      return MercuryEntitySelector_Priority.PRIORITY_SLOW_SPEEDS;
    case 13:
    case 'PRIORITY_EXPECT_DELAYS':
      return MercuryEntitySelector_Priority.PRIORITY_EXPECT_DELAYS;
    case 14:
    case 'PRIORITY_SOME_DELAYS':
      return MercuryEntitySelector_Priority.PRIORITY_SOME_DELAYS;
    case 15:
    case 'PRIORITY_SPECIAL_EVENT':
      return MercuryEntitySelector_Priority.PRIORITY_SPECIAL_EVENT;
    case 16:
    case 'PRIORITY_PLANNED_STATIONS_SKIPPED':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_STATIONS_SKIPPED;
    case 17:
    case 'PRIORITY_STATIONS_SKIPPED':
      return MercuryEntitySelector_Priority.PRIORITY_STATIONS_SKIPPED;
    case 18:
    case 'PRIORITY_DELAYS':
      return MercuryEntitySelector_Priority.PRIORITY_DELAYS;
    case 19:
    case 'PRIORITY_PLANNED_EXPRESS_TO_LOCAL':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_EXPRESS_TO_LOCAL;
    case 20:
    case 'PRIORITY_EXPRESS_TO_LOCAL':
      return MercuryEntitySelector_Priority.PRIORITY_EXPRESS_TO_LOCAL;
    case 21:
    case 'PRIORITY_SOME_REROUTES':
      return MercuryEntitySelector_Priority.PRIORITY_SOME_REROUTES;
    case 22:
    case 'PRIORITY_PLANNED_LOCAL_TO_EXPRESS':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_LOCAL_TO_EXPRESS;
    case 23:
    case 'PRIORITY_LOCAL_TO_EXPRESS':
      return MercuryEntitySelector_Priority.PRIORITY_LOCAL_TO_EXPRESS;
    case 24:
    case 'PRIORITY_PLANNED_BUSES_DETOURED':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_BUSES_DETOURED;
    case 25:
    case 'PRIORITY_BUSES_DETOURED':
      return MercuryEntitySelector_Priority.PRIORITY_BUSES_DETOURED;
    case 26:
    case 'PRIORITY_SERVICE_CHANGE':
      return MercuryEntitySelector_Priority.PRIORITY_SERVICE_CHANGE;
    case 27:
    case 'PRIORITY_PLANNED_TRAINS_REROUTED':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_TRAINS_REROUTED;
    case 28:
    case 'PRIORITY_TRAINS_REROUTED':
      return MercuryEntitySelector_Priority.PRIORITY_TRAINS_REROUTED;
    case 29:
    case 'PRIORITY_BUSING':
      return MercuryEntitySelector_Priority.PRIORITY_BUSING;
    case 30:
    case 'PRIORITY_PLANNED_PART_SUSPENDED':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_PART_SUSPENDED;
    case 31:
    case 'PRIORITY_PART_SUSPENDED':
      return MercuryEntitySelector_Priority.PRIORITY_PART_SUSPENDED;
    case 32:
    case 'PRIORITY_PLANNED_MULTIPLE_IMPACTS':
      return MercuryEntitySelector_Priority.PRIORITY_PLANNED_MULTIPLE_IMPACTS;
    case 33:
    case 'PRIORITY_MULTIPLE_IMPACTS':
      return MercuryEntitySelector_Priority.PRIORITY_MULTIPLE_IMPACTS;
    case 34:
    case 'PRIORITY_SUSPENDED':
      return MercuryEntitySelector_Priority.PRIORITY_SUSPENDED;
    case 35:
    case 'PRIORITY_NO_SCHEDULED_SERVICE':
      return MercuryEntitySelector_Priority.PRIORITY_NO_SCHEDULED_SERVICE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return MercuryEntitySelector_Priority.UNRECOGNIZED;
  }
}

export function mercuryEntitySelector_PriorityToJSON(
  object: MercuryEntitySelector_Priority,
): string {
  switch (object) {
    case MercuryEntitySelector_Priority.PRIORITY_ESSENTIAL_SERVICE:
      return 'PRIORITY_ESSENTIAL_SERVICE';
    case MercuryEntitySelector_Priority.PRIORITY_WEEKEND_SERVICE:
      return 'PRIORITY_WEEKEND_SERVICE';
    case MercuryEntitySelector_Priority.PRIORITY_WEEKDAY_SERVICE:
      return 'PRIORITY_WEEKDAY_SERVICE';
    case MercuryEntitySelector_Priority.PRIORITY_SUNDAY_SCHEDULE:
      return 'PRIORITY_SUNDAY_SCHEDULE';
    case MercuryEntitySelector_Priority.PRIORITY_SATURDAY_SCHEDULE:
      return 'PRIORITY_SATURDAY_SCHEDULE';
    case MercuryEntitySelector_Priority.PRIORITY_HOLIDAY_SERVICE:
      return 'PRIORITY_HOLIDAY_SERVICE';
    case MercuryEntitySelector_Priority.PRIORITY_EXTRA_SERVICE:
      return 'PRIORITY_EXTRA_SERVICE';
    case MercuryEntitySelector_Priority.PRIORITY_SPECIAL_SCHEDULE:
      return 'PRIORITY_SPECIAL_SCHEDULE';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_WORK:
      return 'PRIORITY_PLANNED_WORK';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_BOARDING_CHANGE:
      return 'PRIORITY_PLANNED_BOARDING_CHANGE';
    case MercuryEntitySelector_Priority.PRIORITY_BOARDING_CHANGE:
      return 'PRIORITY_BOARDING_CHANGE';
    case MercuryEntitySelector_Priority.PRIORITY_SLOW_SPEEDS:
      return 'PRIORITY_SLOW_SPEEDS';
    case MercuryEntitySelector_Priority.PRIORITY_EXPECT_DELAYS:
      return 'PRIORITY_EXPECT_DELAYS';
    case MercuryEntitySelector_Priority.PRIORITY_SOME_DELAYS:
      return 'PRIORITY_SOME_DELAYS';
    case MercuryEntitySelector_Priority.PRIORITY_SPECIAL_EVENT:
      return 'PRIORITY_SPECIAL_EVENT';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_STATIONS_SKIPPED:
      return 'PRIORITY_PLANNED_STATIONS_SKIPPED';
    case MercuryEntitySelector_Priority.PRIORITY_STATIONS_SKIPPED:
      return 'PRIORITY_STATIONS_SKIPPED';
    case MercuryEntitySelector_Priority.PRIORITY_DELAYS:
      return 'PRIORITY_DELAYS';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_EXPRESS_TO_LOCAL:
      return 'PRIORITY_PLANNED_EXPRESS_TO_LOCAL';
    case MercuryEntitySelector_Priority.PRIORITY_EXPRESS_TO_LOCAL:
      return 'PRIORITY_EXPRESS_TO_LOCAL';
    case MercuryEntitySelector_Priority.PRIORITY_SOME_REROUTES:
      return 'PRIORITY_SOME_REROUTES';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_LOCAL_TO_EXPRESS:
      return 'PRIORITY_PLANNED_LOCAL_TO_EXPRESS';
    case MercuryEntitySelector_Priority.PRIORITY_LOCAL_TO_EXPRESS:
      return 'PRIORITY_LOCAL_TO_EXPRESS';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_BUSES_DETOURED:
      return 'PRIORITY_PLANNED_BUSES_DETOURED';
    case MercuryEntitySelector_Priority.PRIORITY_BUSES_DETOURED:
      return 'PRIORITY_BUSES_DETOURED';
    case MercuryEntitySelector_Priority.PRIORITY_SERVICE_CHANGE:
      return 'PRIORITY_SERVICE_CHANGE';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_TRAINS_REROUTED:
      return 'PRIORITY_PLANNED_TRAINS_REROUTED';
    case MercuryEntitySelector_Priority.PRIORITY_TRAINS_REROUTED:
      return 'PRIORITY_TRAINS_REROUTED';
    case MercuryEntitySelector_Priority.PRIORITY_BUSING:
      return 'PRIORITY_BUSING';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_PART_SUSPENDED:
      return 'PRIORITY_PLANNED_PART_SUSPENDED';
    case MercuryEntitySelector_Priority.PRIORITY_PART_SUSPENDED:
      return 'PRIORITY_PART_SUSPENDED';
    case MercuryEntitySelector_Priority.PRIORITY_PLANNED_MULTIPLE_IMPACTS:
      return 'PRIORITY_PLANNED_MULTIPLE_IMPACTS';
    case MercuryEntitySelector_Priority.PRIORITY_MULTIPLE_IMPACTS:
      return 'PRIORITY_MULTIPLE_IMPACTS';
    case MercuryEntitySelector_Priority.PRIORITY_SUSPENDED:
      return 'PRIORITY_SUSPENDED';
    case MercuryEntitySelector_Priority.PRIORITY_NO_SCHEDULED_SERVICE:
      return 'PRIORITY_NO_SCHEDULED_SERVICE';
    default:
      return 'UNKNOWN';
  }
}

const baseMercuryFeedHeader: object = { mercuryVersion: '' };

export const MercuryFeedHeader = {
  encode(message: MercuryFeedHeader, writer: Writer = Writer.create()): Writer {
    if (message.mercuryVersion !== '') {
      writer.uint32(10).string(message.mercuryVersion);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MercuryFeedHeader {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMercuryFeedHeader } as MercuryFeedHeader;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mercuryVersion = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MercuryFeedHeader {
    const message = { ...baseMercuryFeedHeader } as MercuryFeedHeader;
    if (object.mercuryVersion !== undefined && object.mercuryVersion !== null) {
      message.mercuryVersion = String(object.mercuryVersion);
    } else {
      message.mercuryVersion = '';
    }
    return message;
  },

  toJSON(message: MercuryFeedHeader): unknown {
    const obj: any = {};
    message.mercuryVersion !== undefined &&
      (obj.mercuryVersion = message.mercuryVersion);
    return obj;
  },

  fromPartial(object: DeepPartial<MercuryFeedHeader>): MercuryFeedHeader {
    const message = { ...baseMercuryFeedHeader } as MercuryFeedHeader;
    if (object.mercuryVersion !== undefined && object.mercuryVersion !== null) {
      message.mercuryVersion = object.mercuryVersion;
    } else {
      message.mercuryVersion = '';
    }
    return message;
  },
};

const baseMercuryStationAlternative: object = {};

export const MercuryStationAlternative = {
  encode(
    message: MercuryStationAlternative,
    writer: Writer = Writer.create(),
  ): Writer {
    if (message.affectedEntity !== undefined) {
      EntitySelector.encode(
        message.affectedEntity,
        writer.uint32(10).fork(),
      ).ldelim();
    }
    if (message.notes !== undefined) {
      TranslatedString.encode(message.notes, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: Reader | Uint8Array,
    length?: number,
  ): MercuryStationAlternative {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMercuryStationAlternative,
    } as MercuryStationAlternative;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.affectedEntity = EntitySelector.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 2:
          message.notes = TranslatedString.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MercuryStationAlternative {
    const message = {
      ...baseMercuryStationAlternative,
    } as MercuryStationAlternative;
    if (object.affectedEntity !== undefined && object.affectedEntity !== null) {
      message.affectedEntity = EntitySelector.fromJSON(object.affectedEntity);
    } else {
      message.affectedEntity = undefined;
    }
    if (object.notes !== undefined && object.notes !== null) {
      message.notes = TranslatedString.fromJSON(object.notes);
    } else {
      message.notes = undefined;
    }
    return message;
  },

  toJSON(message: MercuryStationAlternative): unknown {
    const obj: any = {};
    message.affectedEntity !== undefined &&
      (obj.affectedEntity = message.affectedEntity
        ? EntitySelector.toJSON(message.affectedEntity)
        : undefined);
    message.notes !== undefined &&
      (obj.notes = message.notes
        ? TranslatedString.toJSON(message.notes)
        : undefined);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MercuryStationAlternative>,
  ): MercuryStationAlternative {
    const message = {
      ...baseMercuryStationAlternative,
    } as MercuryStationAlternative;
    if (object.affectedEntity !== undefined && object.affectedEntity !== null) {
      message.affectedEntity = EntitySelector.fromPartial(
        object.affectedEntity,
      );
    } else {
      message.affectedEntity = undefined;
    }
    if (object.notes !== undefined && object.notes !== null) {
      message.notes = TranslatedString.fromPartial(object.notes);
    } else {
      message.notes = undefined;
    }
    return message;
  },
};

const baseMercuryAlert: object = {
  createdAt: 0,
  updatedAt: 0,
  alertType: '',
  servicePlanNumber: '',
  generalOrderNumber: '',
  displayBeforeActive: 0,
  directionality: 0,
  noAffectedStations: false,
  cloneId: '',
};

export const MercuryAlert = {
  encode(message: MercuryAlert, writer: Writer = Writer.create()): Writer {
    if (message.createdAt !== 0) {
      writer.uint32(8).uint64(message.createdAt);
    }
    if (message.updatedAt !== 0) {
      writer.uint32(16).uint64(message.updatedAt);
    }
    if (message.alertType !== '') {
      writer.uint32(26).string(message.alertType);
    }
    for (const v of message.stationAlternative) {
      MercuryStationAlternative.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.servicePlanNumber) {
      writer.uint32(42).string(v!);
    }
    for (const v of message.generalOrderNumber) {
      writer.uint32(50).string(v!);
    }
    if (message.displayBeforeActive !== 0) {
      writer.uint32(56).uint64(message.displayBeforeActive);
    }
    if (message.humanReadableActivePeriod !== undefined) {
      TranslatedString.encode(
        message.humanReadableActivePeriod,
        writer.uint32(66).fork(),
      ).ldelim();
    }
    if (message.additionalInformation !== undefined) {
      TranslatedString.encode(
        message.additionalInformation,
        writer.uint32(74).fork(),
      ).ldelim();
    }
    if (message.directionality !== 0) {
      writer.uint32(80).uint64(message.directionality);
    }
    for (const v of message.affectedStations) {
      EntitySelector.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    if (message.screensSummary !== undefined) {
      TranslatedString.encode(
        message.screensSummary,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    if (message.noAffectedStations === true) {
      writer.uint32(104).bool(message.noAffectedStations);
    }
    if (message.cloneId !== '') {
      writer.uint32(114).string(message.cloneId);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MercuryAlert {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMercuryAlert } as MercuryAlert;
    message.stationAlternative = [];
    message.servicePlanNumber = [];
    message.generalOrderNumber = [];
    message.affectedStations = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.createdAt = longToNumber(reader.uint64() as Long);
          break;
        case 2:
          message.updatedAt = longToNumber(reader.uint64() as Long);
          break;
        case 3:
          message.alertType = reader.string();
          break;
        case 4:
          message.stationAlternative.push(
            MercuryStationAlternative.decode(reader, reader.uint32()),
          );
          break;
        case 5:
          message.servicePlanNumber.push(reader.string());
          break;
        case 6:
          message.generalOrderNumber.push(reader.string());
          break;
        case 7:
          message.displayBeforeActive = longToNumber(reader.uint64() as Long);
          break;
        case 8:
          message.humanReadableActivePeriod = TranslatedString.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 9:
          message.additionalInformation = TranslatedString.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 10:
          message.directionality = longToNumber(reader.uint64() as Long);
          break;
        case 11:
          message.affectedStations.push(
            EntitySelector.decode(reader, reader.uint32()),
          );
          break;
        case 12:
          message.screensSummary = TranslatedString.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 13:
          message.noAffectedStations = reader.bool();
          break;
        case 14:
          message.cloneId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MercuryAlert {
    const message = { ...baseMercuryAlert } as MercuryAlert;
    message.stationAlternative = [];
    message.servicePlanNumber = [];
    message.generalOrderNumber = [];
    message.affectedStations = [];
    if (object.createdAt !== undefined && object.createdAt !== null) {
      message.createdAt = Number(object.createdAt);
    } else {
      message.createdAt = 0;
    }
    if (object.updatedAt !== undefined && object.updatedAt !== null) {
      message.updatedAt = Number(object.updatedAt);
    } else {
      message.updatedAt = 0;
    }
    if (object.alertType !== undefined && object.alertType !== null) {
      message.alertType = String(object.alertType);
    } else {
      message.alertType = '';
    }
    if (
      object.stationAlternative !== undefined &&
      object.stationAlternative !== null
    ) {
      for (const e of object.stationAlternative) {
        message.stationAlternative.push(MercuryStationAlternative.fromJSON(e));
      }
    }
    if (
      object.servicePlanNumber !== undefined &&
      object.servicePlanNumber !== null
    ) {
      for (const e of object.servicePlanNumber) {
        message.servicePlanNumber.push(String(e));
      }
    }
    if (
      object.generalOrderNumber !== undefined &&
      object.generalOrderNumber !== null
    ) {
      for (const e of object.generalOrderNumber) {
        message.generalOrderNumber.push(String(e));
      }
    }
    if (
      object.displayBeforeActive !== undefined &&
      object.displayBeforeActive !== null
    ) {
      message.displayBeforeActive = Number(object.displayBeforeActive);
    } else {
      message.displayBeforeActive = 0;
    }
    if (
      object.humanReadableActivePeriod !== undefined &&
      object.humanReadableActivePeriod !== null
    ) {
      message.humanReadableActivePeriod = TranslatedString.fromJSON(
        object.humanReadableActivePeriod,
      );
    } else {
      message.humanReadableActivePeriod = undefined;
    }
    if (
      object.additionalInformation !== undefined &&
      object.additionalInformation !== null
    ) {
      message.additionalInformation = TranslatedString.fromJSON(
        object.additionalInformation,
      );
    } else {
      message.additionalInformation = undefined;
    }
    if (object.directionality !== undefined && object.directionality !== null) {
      message.directionality = Number(object.directionality);
    } else {
      message.directionality = 0;
    }
    if (
      object.affectedStations !== undefined &&
      object.affectedStations !== null
    ) {
      for (const e of object.affectedStations) {
        message.affectedStations.push(EntitySelector.fromJSON(e));
      }
    }
    if (object.screensSummary !== undefined && object.screensSummary !== null) {
      message.screensSummary = TranslatedString.fromJSON(object.screensSummary);
    } else {
      message.screensSummary = undefined;
    }
    if (
      object.noAffectedStations !== undefined &&
      object.noAffectedStations !== null
    ) {
      message.noAffectedStations = Boolean(object.noAffectedStations);
    } else {
      message.noAffectedStations = false;
    }
    if (object.cloneId !== undefined && object.cloneId !== null) {
      message.cloneId = String(object.cloneId);
    } else {
      message.cloneId = '';
    }
    return message;
  },

  toJSON(message: MercuryAlert): unknown {
    const obj: any = {};
    message.createdAt !== undefined && (obj.createdAt = message.createdAt);
    message.updatedAt !== undefined && (obj.updatedAt = message.updatedAt);
    message.alertType !== undefined && (obj.alertType = message.alertType);
    if (message.stationAlternative) {
      obj.stationAlternative = message.stationAlternative.map((e) =>
        e ? MercuryStationAlternative.toJSON(e) : undefined,
      );
    } else {
      obj.stationAlternative = [];
    }
    if (message.servicePlanNumber) {
      obj.servicePlanNumber = message.servicePlanNumber.map((e) => e);
    } else {
      obj.servicePlanNumber = [];
    }
    if (message.generalOrderNumber) {
      obj.generalOrderNumber = message.generalOrderNumber.map((e) => e);
    } else {
      obj.generalOrderNumber = [];
    }
    message.displayBeforeActive !== undefined &&
      (obj.displayBeforeActive = message.displayBeforeActive);
    message.humanReadableActivePeriod !== undefined &&
      (obj.humanReadableActivePeriod = message.humanReadableActivePeriod
        ? TranslatedString.toJSON(message.humanReadableActivePeriod)
        : undefined);
    message.additionalInformation !== undefined &&
      (obj.additionalInformation = message.additionalInformation
        ? TranslatedString.toJSON(message.additionalInformation)
        : undefined);
    message.directionality !== undefined &&
      (obj.directionality = message.directionality);
    if (message.affectedStations) {
      obj.affectedStations = message.affectedStations.map((e) =>
        e ? EntitySelector.toJSON(e) : undefined,
      );
    } else {
      obj.affectedStations = [];
    }
    message.screensSummary !== undefined &&
      (obj.screensSummary = message.screensSummary
        ? TranslatedString.toJSON(message.screensSummary)
        : undefined);
    message.noAffectedStations !== undefined &&
      (obj.noAffectedStations = message.noAffectedStations);
    message.cloneId !== undefined && (obj.cloneId = message.cloneId);
    return obj;
  },

  fromPartial(object: DeepPartial<MercuryAlert>): MercuryAlert {
    const message = { ...baseMercuryAlert } as MercuryAlert;
    message.stationAlternative = [];
    message.servicePlanNumber = [];
    message.generalOrderNumber = [];
    message.affectedStations = [];
    if (object.createdAt !== undefined && object.createdAt !== null) {
      message.createdAt = object.createdAt;
    } else {
      message.createdAt = 0;
    }
    if (object.updatedAt !== undefined && object.updatedAt !== null) {
      message.updatedAt = object.updatedAt;
    } else {
      message.updatedAt = 0;
    }
    if (object.alertType !== undefined && object.alertType !== null) {
      message.alertType = object.alertType;
    } else {
      message.alertType = '';
    }
    if (
      object.stationAlternative !== undefined &&
      object.stationAlternative !== null
    ) {
      for (const e of object.stationAlternative) {
        message.stationAlternative.push(
          MercuryStationAlternative.fromPartial(e),
        );
      }
    }
    if (
      object.servicePlanNumber !== undefined &&
      object.servicePlanNumber !== null
    ) {
      for (const e of object.servicePlanNumber) {
        message.servicePlanNumber.push(e);
      }
    }
    if (
      object.generalOrderNumber !== undefined &&
      object.generalOrderNumber !== null
    ) {
      for (const e of object.generalOrderNumber) {
        message.generalOrderNumber.push(e);
      }
    }
    if (
      object.displayBeforeActive !== undefined &&
      object.displayBeforeActive !== null
    ) {
      message.displayBeforeActive = object.displayBeforeActive;
    } else {
      message.displayBeforeActive = 0;
    }
    if (
      object.humanReadableActivePeriod !== undefined &&
      object.humanReadableActivePeriod !== null
    ) {
      message.humanReadableActivePeriod = TranslatedString.fromPartial(
        object.humanReadableActivePeriod,
      );
    } else {
      message.humanReadableActivePeriod = undefined;
    }
    if (
      object.additionalInformation !== undefined &&
      object.additionalInformation !== null
    ) {
      message.additionalInformation = TranslatedString.fromPartial(
        object.additionalInformation,
      );
    } else {
      message.additionalInformation = undefined;
    }
    if (object.directionality !== undefined && object.directionality !== null) {
      message.directionality = object.directionality;
    } else {
      message.directionality = 0;
    }
    if (
      object.affectedStations !== undefined &&
      object.affectedStations !== null
    ) {
      for (const e of object.affectedStations) {
        message.affectedStations.push(EntitySelector.fromPartial(e));
      }
    }
    if (object.screensSummary !== undefined && object.screensSummary !== null) {
      message.screensSummary = TranslatedString.fromPartial(
        object.screensSummary,
      );
    } else {
      message.screensSummary = undefined;
    }
    if (
      object.noAffectedStations !== undefined &&
      object.noAffectedStations !== null
    ) {
      message.noAffectedStations = object.noAffectedStations;
    } else {
      message.noAffectedStations = false;
    }
    if (object.cloneId !== undefined && object.cloneId !== null) {
      message.cloneId = object.cloneId;
    } else {
      message.cloneId = '';
    }
    return message;
  },
};

const baseMercuryEntitySelector: object = { sortOrder: '' };

export const MercuryEntitySelector = {
  encode(
    message: MercuryEntitySelector,
    writer: Writer = Writer.create(),
  ): Writer {
    if (message.sortOrder !== '') {
      writer.uint32(10).string(message.sortOrder);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MercuryEntitySelector {
    const reader = input instanceof Reader ? input : new Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMercuryEntitySelector } as MercuryEntitySelector;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sortOrder = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MercuryEntitySelector {
    const message = { ...baseMercuryEntitySelector } as MercuryEntitySelector;
    if (object.sortOrder !== undefined && object.sortOrder !== null) {
      message.sortOrder = String(object.sortOrder);
    } else {
      message.sortOrder = '';
    }
    return message;
  },

  toJSON(message: MercuryEntitySelector): unknown {
    const obj: any = {};
    message.sortOrder !== undefined && (obj.sortOrder = message.sortOrder);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MercuryEntitySelector>,
  ): MercuryEntitySelector {
    const message = { ...baseMercuryEntitySelector } as MercuryEntitySelector;
    if (object.sortOrder !== undefined && object.sortOrder !== null) {
      message.sortOrder = object.sortOrder;
    } else {
      message.sortOrder = '';
    }
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  throw 'Unable to locate global object';
})();

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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }
  return long.toNumber();
}

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
