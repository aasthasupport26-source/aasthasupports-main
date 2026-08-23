-- Add DB transaction function for atomic booking + payment creation
CREATE OR REPLACE FUNCTION create_booking_with_payment(
  booking_data JSONB,
  payment_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  new_booking_id UUID;
  result JSONB;
BEGIN
  -- Insert booking
  INSERT INTO pooja_bookings (
    booking_number,
    user_id,
    devotee_name,
    phone,
    email,
    gotra,
    pooja_type,
    preferred_date,
    sankalp,
    notes,
    amount,
    status
  )
  VALUES (
    (booking_data->>'booking_number')::TEXT,
    NULLIF(booking_data->>'user_id', '')::UUID,
    (booking_data->>'devotee_name')::TEXT,
    (booking_data->>'phone')::TEXT,
    NULLIF(booking_data->>'email', ''),
    NULLIF(booking_data->>'gotra', ''),
    (booking_data->>'pooja_type')::TEXT,
    NULLIF(booking_data->>'preferred_date', ''),
    NULLIF(booking_data->>'sankalp', ''),
    NULLIF(booking_data->>'notes', ''),
    (booking_data->>'amount')::NUMERIC,
    (booking_data->>'status')::TEXT
  )
  RETURNING id INTO new_booking_id;

  -- Insert payment
  INSERT INTO booking_payments (
    booking_id,
    amount,
    currency,
    gateway,
    gateway_order_id,
    gateway_payment_id,
    gateway_signature,
    status
  )
  VALUES (
    new_booking_id,
    (payment_data->>'amount')::NUMERIC,
    (payment_data->>'currency')::TEXT,
    (payment_data->>'gateway')::TEXT,
    (payment_data->>'gateway_order_id')::TEXT,
    (payment_data->>'gateway_payment_id')::TEXT,
    (payment_data->>'gateway_signature')::TEXT,
    (payment_data->>'status')::TEXT
  );

  -- Return booking ID
  result := jsonb_build_object('booking_id', new_booking_id);
  RETURN result;
END;
$$;
