
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"

// Mock categories for demonstration
const categories = ["Backpacks",
  "External Keyboards",
  "Headphones and Earphones",
  "Keys",
  "Laptop Chargers",
  "Laptops",
  "Mouse",
  "Smartphones",
  "Unknown",
  "Wallets"]

export default function FilterPanel() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [distance, setDistance] = useState([5])
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleReset = () => {
    setSelectedCategories([])
    setDistance([5])
    setStartDate(undefined)
    setEndDate(undefined)
  }

  return (
    <div className="py-4 space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={`category-${category}`}>{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Date Range</h3>
        <div className="space-y-2">
          <div>
            <Label>From</Label>
            <DatePicker date={startDate} setDate={setStartDate} className="w-full" />
          </div>
          <div>
            <Label>To</Label>
            <DatePicker date={endDate} setDate={setEndDate} className="w-full" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Distance</h3>
        <div className="space-y-2">
          <Slider value={distance} onValueChange={setDistance} max={50} step={1} />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 km</span>
            <span>{distance[0]} km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Location</h3>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Location</SelectItem>
            <SelectItem value="custom">Custom Location</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="w-1/2" onClick={handleReset}>
          Reset
        </Button>
        <Button className="w-1/2 bg-orange-500 hover:bg-orange-600">Apply Filters</Button>
      </div>
    </div>
  )
}

