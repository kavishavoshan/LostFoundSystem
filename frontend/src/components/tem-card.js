import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Calendar, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ItemCard({ item }) {
  const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Link href={`/items/${item.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
        <div className="relative h-48 w-full">
          <Image src={item.imageUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
          <Badge
            className={`absolute top-2 right-2 ${
              item.type === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {item.type === "lost" ? "Lost" : "Found"}
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
          <Badge variant="outline" className="w-fit">
            {item.category}
          </Badge>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 flex flex-col items-start gap-1">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

