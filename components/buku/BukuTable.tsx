import { Book } from "@/types/buku";

interface Props {
  books: Book[];
}

export default function BookTable({
  books
}:Props) {

  return (
    <table
      style={{
        width:"100%",
        borderCollapse:"collapse",
        background:"white"
      }}
    >
      <thead>
        <tr
          style={{
            background:"#836CEC",
            color:"white"
          }}
        >
          <th>Judul</th>
          <th>Pengarang</th>
          <th>Tahun</th>
          <th>Stok</th>
        </tr>
      </thead>

      <tbody>
        {books.map((book)=>(
          <tr key={book.id}>
            <td>{book.title}</td>
            <td>{book.author}</td>
            <td>{book.publication_year}</td>
            <td>{book.stock}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}