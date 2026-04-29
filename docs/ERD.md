# Folio Entity Relationship Diagram

## Entities

### notes
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, generated |
| title | varchar(255) | NOT NULL |
| content | text | NOT NULL |
| archived | boolean | DEFAULT false |
| deleted | boolean | DEFAULT false |
| deletedAt | timestamp | NULLABLE |
| isPublic | boolean | DEFAULT false |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, generated |
| name | varchar(100) | UNIQUE, NOT NULL |

### note_categories (join table)
| Column | Type | Constraints |
|--------|------|-------------|
| note_id | uuid | FK → notes.id |
| category_id | uuid | FK → categories.id |

## Relationships

- `Note` ManyToMany `Category` via `note_categories` join table
- Join table is auto-managed by TypeORM `@JoinTable` decorator on `Note.categories`
