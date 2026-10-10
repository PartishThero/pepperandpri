/**
 * In-memory state store for active Google Drive session.
 * Does not write photos or palettes to local disk.
 * When the Google Drive folder changes, state is purged and re-streamed from Drive.
 */
class MemoryStore {
  constructor() {
    this.currentFolderId = null;
    this.photos = new Map();
    this.groups = new Map();
  }

  async init() {
    return Promise.resolve();
  }

  reset(folderId = null) {
    this.currentFolderId = folderId;
    this.photos.clear();
    this.groups.clear();
  }

  async savePhoto(photo) {
    this.photos.set(photo.id, photo);
    return photo;
  }

  async getPhotoById(id) {
    return this.photos.get(id) || null;
  }

  async getAllPhotos() {
    return Array.from(this.photos.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async saveGroup(group) {
    this.groups.set(group.id, group);
    return group;
  }

  async getGroupById(id) {
    return this.groups.get(id) || null;
  }

  async getAllGroups() {
    return Array.from(this.groups.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }
}

export const db = new MemoryStore();
export default db;
