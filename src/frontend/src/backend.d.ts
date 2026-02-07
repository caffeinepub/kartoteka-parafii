import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PaginatedResult_1 {
    data: Array<Parishioner>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface PaginatedResult_6 {
    data: Array<Locality>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface ParishFunctionLocalityAssignment {
    uid: UniqueId;
    contacts: Array<string>;
    localityName: string;
    description: string;
    assignedParishioners: Array<bigint>;
}
export interface Task {
    description: string;
    assignedParishioners: Array<bigint>;
}
export interface Sacraments {
    confirmationYear?: bigint;
    funeralYear?: bigint;
    marriageYear?: bigint;
    communionYear?: bigint;
    birthYear?: bigint;
    baptismYear?: bigint;
}
export interface ParishNote {
    title: string;
    content: string;
    timestamp: bigint;
}
export interface PaginatedResult_2 {
    data: Array<ParishNote>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface FamilyMember {
    relationType: RelationType;
    name: string;
    sacraments: Sacraments;
}
export interface BudgetTransaction {
    uid: UniqueId;
    relatedParishioner?: bigint;
    type: TransactionType;
    description: string;
    timestamp: bigint;
    category: string;
    amount: bigint;
    relatedLocality?: string;
}
export interface AnniversaryPdfExport {
    year: bigint;
    anniversaries: Array<Anniversary>;
}
export interface PaginatedResult_5 {
    data: Array<LocalityWithParishioners>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface PaginatedResult_10 {
    data: Array<BudgetTransaction>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface PaginatedResult {
    data: Array<StatisticEntry>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface GetAnniversariesRequest {
    anniversaryType?: AnniversaryType;
    page?: bigint;
    year: bigint;
    pageSize?: bigint;
}
export interface GetAnniversariesPdfExportRequest {
    anniversaryType?: AnniversaryType;
    year: bigint;
}
export interface PaginatedResult_8 {
    data: Array<Event>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface LocalityWithParishioners {
    residents: Array<LocalityResident>;
    tasks: Array<string>;
    name: string;
    contactPerson: string;
    totalParishioners: bigint;
    phone: string;
}
export interface LocalityResident {
    relationType?: RelationType;
    name: string;
    isFamilyMember: boolean;
}
export interface IndividualOffering {
    id: UniqueId;
    year: bigint;
    description: string;
    timestamp: bigint;
    parishionerId: bigint;
    amount: bigint;
}
export interface Letter {
    uid: bigint;
    title: string;
    body: string;
    date: bigint;
    year: bigint;
    number: bigint;
}
export interface PaginatedResult_7 {
    data: Array<IndividualOffering>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface Event {
    uid: UniqueId;
    tasks: Array<Task>;
    title: string;
    description: string;
    timestamp: bigint;
}
export type UniqueId = bigint;
export interface PaginatedResult_11 {
    data: Array<Anniversary>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface ParishFunctionAssignment {
    uid: UniqueId;
    assignedParishioner: bigint;
    title: string;
    contacts: Array<string>;
    description: string;
    address: string;
}
export interface PaginatedResult_3 {
    data: Array<ParishFunctionLocalityAssignment>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface CollectiveOffering {
    id: UniqueId;
    year: bigint;
    description: string;
    timestamp: bigint;
    amount: bigint;
    locality: string;
}
export interface PaginatedResult_9 {
    data: Array<CollectiveOffering>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface Parishioner {
    uid: bigint;
    birthYear?: bigint;
    profession?: string;
    offers: Array<Offer>;
    email?: string;
    pastoralNotes?: string;
    address?: string;
    sacraments: Sacraments;
    phone?: string;
    photo?: ExternalBlob;
    lastName: string;
    family: Array<FamilyMember>;
    firstName: string;
}
export interface StatisticEntry {
    communionCount: bigint;
    timestamp: bigint;
    sundayAttendance: bigint;
}
export interface Offer {
    year: bigint;
    description: string;
    amount: bigint;
}
export interface Locality {
    tasks: Array<string>;
    name: string;
    contactPerson: string;
    phone: string;
}
export interface PaginatedResult_4 {
    data: Array<ParishFunctionAssignment>;
    totalCount: bigint;
    pageSize: bigint;
    currentPage: bigint;
    pageCount: bigint;
}
export interface Anniversary {
    anniversaryType: AnniversaryType;
    address?: string;
    targetYear: bigint;
    parishionerId: bigint;
    anniversaryNumber: bigint;
    lastName: string;
    eventYear: bigint;
    firstName: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum AnniversaryType {
    baptism = "baptism",
    marriage = "marriage",
    funeral = "funeral"
}
export enum RelationType {
    other = "other",
    child = "child",
    spouse = "spouse"
}
export enum TransactionType {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBudgetTransaction(transaction: BudgetTransaction): Promise<UniqueId>;
    addCollectiveOffering(offering: CollectiveOffering): Promise<UniqueId>;
    addEvent(arg0: Event): Promise<UniqueId>;
    addIndividualOffering(offering: IndividualOffering): Promise<UniqueId>;
    addLetter(title: string, body: string, year: bigint): Promise<bigint>;
    addLocality(locality: Locality): Promise<void>;
    addParishFunctionAssignment(arg0: ParishFunctionAssignment): Promise<UniqueId>;
    addParishFunctionLocalityAssignment(arg0: ParishFunctionLocalityAssignment): Promise<UniqueId>;
    addParishNote(arg0: ParishNote): Promise<UniqueId>;
    addParishioner(arg0: Parishioner): Promise<bigint>;
    addStatisticEntry(arg0: StatisticEntry): Promise<UniqueId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBudgetTransaction(uid: UniqueId): Promise<void>;
    deleteCollectiveOffering(id: UniqueId): Promise<void>;
    deleteEvent(id: UniqueId): Promise<void>;
    deleteIndividualOffering(id: UniqueId): Promise<void>;
    deleteLetter(uid: bigint): Promise<void>;
    deleteLocality(name: string): Promise<void>;
    deleteParishFunctionAssignment(id: UniqueId): Promise<void>;
    deleteParishFunctionLocalityAssignment(id: UniqueId): Promise<void>;
    deleteParishNote(id: UniqueId): Promise<void>;
    deleteParishioner(id: bigint): Promise<void>;
    deleteStatisticEntry(id: UniqueId): Promise<void>;
    getAllCollectiveOfferings(): Promise<Array<CollectiveOffering>>;
    getAllIndividualOfferings(): Promise<Array<IndividualOffering>>;
    getAllLetters(): Promise<Array<Letter>>;
    getAllPaginatedParishFunctionData(page: bigint | null, pageSize: bigint | null): Promise<{
        assignments: PaginatedResult_4;
        localityAssignments: PaginatedResult_3;
    }>;
    getAllResidents(): Promise<Array<LocalityResident>>;
    getAnniversariesForYearPaginated(request: GetAnniversariesRequest): Promise<PaginatedResult_11>;
    getAnniversariesForYearPdfExport(request: GetAnniversariesPdfExportRequest): Promise<AnniversaryPdfExport>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCollectiveOffering(id: UniqueId): Promise<CollectiveOffering | null>;
    getCollectiveOfferingsByLocality(locality: string): Promise<Array<CollectiveOffering>>;
    getIndividualOffering(id: UniqueId): Promise<IndividualOffering | null>;
    getIndividualOfferingsByParishioner(parishionerId: bigint): Promise<Array<IndividualOffering>>;
    getLetter(uid: bigint): Promise<Letter | null>;
    getOverallBudgetBalance(): Promise<bigint>;
    getPaginatedBudgetTransactions(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_10>;
    getPaginatedBudgetTransactionsByDateRange(page: bigint | null, pageSize: bigint | null, startTimestamp: bigint, endTimestamp: bigint): Promise<PaginatedResult_10>;
    getPaginatedCollectiveOfferings(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_9>;
    getPaginatedEvents(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_8>;
    getPaginatedIndividualOfferings(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_7>;
    getPaginatedLocalities(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_6>;
    getPaginatedLocalitiesWithParishioners(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_5>;
    getPaginatedParishFunctionAssignments(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_4>;
    getPaginatedParishFunctionLocalityAssignments(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_3>;
    getPaginatedParishNotes(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_2>;
    getPaginatedParishioners(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult_1>;
    getPaginatedStatisticEntries(page: bigint | null, pageSize: bigint | null): Promise<PaginatedResult>;
    getResidentCountByLocality(localityName: string): Promise<bigint>;
    getResidentsByLocality(localityName: string): Promise<Array<LocalityResident>>;
    getTotalResidentCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasParishioners(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBudgetTransaction(uid: UniqueId, transaction: BudgetTransaction): Promise<void>;
    updateCollectiveOffering(id: UniqueId, offering: CollectiveOffering): Promise<void>;
    updateEvent(id: UniqueId, event: Event): Promise<void>;
    updateIndividualOffering(id: UniqueId, offering: IndividualOffering): Promise<void>;
    updateLetter(uid: bigint, title: string, body: string): Promise<void>;
    updateLocality(name: string, locality: Locality): Promise<void>;
    updateParishFunctionAssignment(id: UniqueId, assignment: ParishFunctionAssignment): Promise<void>;
    updateParishFunctionLocalityAssignment(id: UniqueId, assignment: ParishFunctionLocalityAssignment): Promise<void>;
    updateParishNote(id: UniqueId, note: ParishNote): Promise<void>;
    updateParishioner(id: bigint, parishioner: Parishioner): Promise<void>;
    updateStatisticEntry(id: UniqueId, entry: StatisticEntry): Promise<void>;
}
