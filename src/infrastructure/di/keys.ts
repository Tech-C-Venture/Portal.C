/**
 * DIキー定義
 * シンボルを使用して型安全な依存性解決を実現
 */

/**
 * リポジトリのDIキー
 */
export const REPOSITORY_KEYS = {
  MEMBER: Symbol.for('IMemberRepository'),
  EVENT: Symbol.for('IEventRepository'),
  TIMETABLE: Symbol.for('ITimetableRepository'),
} as const;

/**
 * サービスのDIキー
 */
export const SERVICE_KEYS = {
  AUTH: Symbol.for('IAuthService'),
  DATABASE: Symbol.for('IDatabaseClient'),
} as const;

/**
 * ユースケースのDIキー
 */
export const USE_CASE_KEYS = {
  GET_MEMBER_PROFILE: Symbol.for('GetMemberProfileUseCase'),
  UPDATE_MEMBER_PROFILE: Symbol.for('UpdateMemberProfileUseCase'),
  GET_EVENT_LIST: Symbol.for('GetEventListUseCase'),
  REGISTER_FOR_EVENT: Symbol.for('RegisterForEventUseCase'),
  CREATE_EVENT: Symbol.for('CreateEventUseCase'),
  GET_TIMETABLE: Symbol.for('GetTimetableUseCase'),
} as const;
