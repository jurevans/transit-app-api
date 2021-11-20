import { Transform } from 'class-transformer';
import { Alert, TranslatedString } from 'realtime/proto/gtfs-realtime';
import { getAlertTranslationText } from 'util/';

export class AlertEntity {
  @Transform(({ value }: { value: TranslatedString | undefined }) =>
    getAlertTranslationText(value, 'en'),
  )
  headerText: string;

  @Transform(({ value }: { value: TranslatedString | undefined }) =>
    getAlertTranslationText(value, 'en'),
  )
  descriptionText: string;

  constructor(partial: Partial<Alert>) {
    Object.assign(this, partial);
  }
}
