package model
import java.util.Date
import org.squeryl.PrimitiveTypeMode._
import org.squeryl.Schema
import org.squeryl.KeyedEntity
import org.squeryl.annotations.Column

case class News(title: String, text: String, @Column("author_id") authorId: Long, published: Date) extends KeyedEntity[Long] {
  val id: Long = 0L
}

case class User(name: String, email: String, @Column("github_username") githubUsername: String, @Column("open_id") openId: String) extends KeyedEntity[Long] {
  val id: Long = 0L
}

object Hackathon extends Schema {
  val news = table[News]
  val users = table[User]("Users")
}
