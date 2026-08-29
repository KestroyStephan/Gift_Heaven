import { assets } from "../assets/assets";

return (
    <div>
        <h3>Order Page</h3>
        <div>
            {
                orders.map((order, index) => (
                    <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-300 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
                        <img src={assets.parcel_icon} />
                        <div>

                            <div>
                                {order.items.map((item, index) => {
                                    if (index === order.items.length - 1) {

                                        return <p key={index}>{item.name} X {item.quantity} <span>{item.size}</span></p>

                                    } else {
                                        return <p key={index}>{item.name} X {item.quantity} <span>{item.size}</span> ,</p>
                                    }
                                })}
                            </div>
                            <p>{order.address.firstName + " " + order.address.lastName}</p>
                            <div>
                                <p>{order.address.street + ", "}</p>
                                <p>{order.address.city + ", " + order.address.state + " ," + order.address.country + " ," + order.address.zipcode}</p>
                            </div>
                            <p>{order.address.phone}</p>
                        </div>
                        <div>
                            <p>Items : {order.items.length}</p>
                            <p>Method : {order.paymentMethod}</p>
                            <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>
                            <p>Date : {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <p>{currency}{order.amount}</p>
                        <select>
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packing">Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for delivery">Out for delivery</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>

                ))
            }
        </div>
    </div>
)

