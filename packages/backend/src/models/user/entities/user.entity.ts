import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
@Index(['email', 'account'])
export class User {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  name?: string;

  @Column()
  @Index({ unique: true })
  email?: string;

  @Column()
  @Index({ unique: true })
  account: string;
}
